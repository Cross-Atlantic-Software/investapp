import { Request, Response } from "express";
import { Op } from "sequelize";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import sendMail from "../../utils";
import { EmailTemplateService } from "../../utils/emailTemplateService";

// Extend Request interface to include files property from multer
interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class KYCManagementController {
  private kycModel = db.KYCApplication;
  private userModel = db.User;

  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  // Get all KYC applications with pagination and search
  getAllKYCApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const status = req.query.status as string || '';
      const sortBy = req.query.sort_by as string || 'createdAt';
      const sortOrder = req.query.sort_order as string || 'DESC';

      const offset = (page - 1) * limit;

      // Validate sort fields to prevent SQL injection
      const allowedSortFields = ['id', 'user_id', 'pan_number', 'name_pan', 'status', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      // Build where clause for search and status filter
      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { pan_number: { [Op.like]: `%${search}%` } },
          { name_pan: { [Op.like]: `%${search}%` } },
          { aadhar_number: { [Op.like]: `%${search}%` } },
          { account_number: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status && ['pending', 'verified', 'rejected'].includes(status)) {
        whereClause.status = status;
      }

      // Get total count
      const totalCount = await this.kycModel.count({ where: whereClause });

      // Get KYC applications with user information
      const kycApplications = await this.kycModel.findAll({
        where: whereClause,
        include: [
          {
            model: this.userModel,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          }
        ],
        limit,
        offset,
        order: [[validSortBy, validSortOrder]]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          kycApplications,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching KYC applications:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch KYC applications'
      });
    }
  };

  // Get KYC application by ID
  getKYCApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const { id } = req.params;

      const kycApplication = await this.kycModel.findByPk(id, {
        include: [
          {
            model: this.userModel,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          }
        ]
      });

      if (!kycApplication) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'KYC application not found'
        });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: { kycApplication }
      });
    } catch (error) {
      console.error('Error fetching KYC application:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch KYC application'
      });
    }
  };

  // Create new KYC application (for site users)
  createKYCApplication = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Get user_id from authenticated user (site user)
      const user_id = parseInt((req.user as any)?.user_id || '0');
      
      if (!user_id) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const {
        pan_number,
        name_pan,
        dob,
        father_name,
        residency_status,
        aadhar_number,
        account_number,
        ifsc_code,
        demat_type,
        demat_account_id
      } = req.body;

      // Validate required fields
      if (!pan_number || !name_pan || !dob || !father_name || !residency_status ||
          !aadhar_number || !account_number || !ifsc_code || 
          !demat_type || !demat_account_id) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'All fields are required'
        });
        return;
      }

      // Check if user already has a KYC application
      const existingKYC = await this.kycModel.findOne({
        where: { user_id }
      });

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let bank_proof = '';
      let sign = '';
      let pan = '';
      let aadhar = '';
      let demat = '';

      if (files) {
        // Get bank proof file
        if (files.bank_proof && files.bank_proof[0]) {
          bank_proof = (files.bank_proof[0] as any).location; // S3 file URL
        } else if (existingKYC) {
          // Use existing file if no new file uploaded
          bank_proof = existingKYC.bank_proof || '';
        }

        // Get signature file
        if (files.sign && files.sign[0]) {
          sign = (files.sign[0] as any).location; // S3 file URL
        } else if (existingKYC) {
          // Use existing file if no new file uploaded
          sign = existingKYC.sign || '';
        }

        // Get PAN file
        if (files.pan && files.pan[0]) {
          pan = (files.pan[0] as any).location; // S3 file URL
        } else if (existingKYC) {
          // Use existing file if no new file uploaded
          pan = existingKYC.pan || '';
        }

        // Get Aadhar file
        if (files.aadhar && files.aadhar[0]) {
          aadhar = (files.aadhar[0] as any).location; // S3 file URL
        } else if (existingKYC) {
          // Use existing file if no new file uploaded
          aadhar = existingKYC.aadhar || '';
        }

        // Get Demat file
        if (files.demat && files.demat[0]) {
          demat = (files.demat[0] as any).location; // S3 file URL
        } else if (existingKYC) {
          // Use existing file if no new file uploaded
          demat = existingKYC.demat || '';
        }
      } else if (existingKYC) {
        // If no new files uploaded, use all existing files
        bank_proof = existingKYC.bank_proof || '';
        sign = existingKYC.sign || '';
        pan = existingKYC.pan || '';
        aadhar = existingKYC.aadhar || '';
        demat = existingKYC.demat || '';
      }

      // Validate that all required files exist (either new uploads or existing files)
      if (!bank_proof || !sign || !pan || !aadhar || !demat) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'All document files are required: bank proof, signature, PAN, Aadhar, and Demat'
        });
        return;
      }

      let kycApplication;

      if (existingKYC) {
        // Update existing KYC application and set status back to pending
        await existingKYC.update({
          pan_number: pan_number.toUpperCase(),
          name_pan,
          dob,
          father_name,
          residency_status,
          aadhar_number,
          account_number,
          ifsc_code: ifsc_code.toUpperCase(),
          bank_proof,
          demat_type,
          demat_account_id,
          sign,
          pan,
          aadhar,
          demat,
          status: 'pending' // Set back to pending for admin review
        });
        await existingKYC.reload();
        kycApplication = existingKYC;

        // Send acknowledgement email
        try {
          const user = await this.userModel.findByPk(user_id);
          if (user) {
            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
            const emailTemplate = await EmailTemplateService.getKYCSubmissionEmail(
              user.email,
              userName
            );
            
            if (emailTemplate) {
              await sendMail(user.email, emailTemplate.subject, emailTemplate.body);
              console.log(`✅ KYC submission acknowledgement email sent to: ${user.email}`);
            } else {
              console.error('❌ KYC submission email template not found');
            }
          }
        } catch (emailError) {
          console.error('❌ Failed to send KYC submission acknowledgement email:', emailError);
          // Don't fail the update if email fails
        }

        res.status(HttpStatusCode.OK).json({
          success: true,
          data: { kycApplication },
          message: 'KYC application updated successfully and is pending review'
        });
      } else {
        // Create new KYC application
        kycApplication = await this.kycModel.create({
          user_id,
          pan_number: pan_number.toUpperCase(),
          name_pan,
          dob,
          father_name,
          residency_status,
          aadhar_number,
          account_number,
          ifsc_code: ifsc_code.toUpperCase(),
          bank_proof,
          demat_type,
          demat_account_id,
          sign,
          pan,
          aadhar,
          demat,
          status: 'pending'
        });

        // Send acknowledgement email
        try {
          const user = await this.userModel.findByPk(user_id);
          if (user) {
            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
            const emailTemplate = await EmailTemplateService.getKYCSubmissionEmail(
              user.email,
              userName
            );
            
            if (emailTemplate) {
              await sendMail(user.email, emailTemplate.subject, emailTemplate.body);
              console.log(`✅ KYC submission acknowledgement email sent to: ${user.email}`);
            } else {
              console.error('❌ KYC submission email template not found');
            }
          }
        } catch (emailError) {
          console.error('❌ Failed to send KYC submission acknowledgement email:', emailError);
          // Don't fail the creation if email fails
        }

        res.status(HttpStatusCode.CREATED).json({
          success: true,
          data: { kycApplication },
          message: 'KYC application created successfully'
        });
      }
    } catch (error) {
      console.error('Error creating KYC application:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create KYC application'
      });
    }
  };

  // Get KYC application for current user (site user)
  getMyKYCApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Get user_id from authenticated user (site user)
      const user_id = parseInt((req.user as any)?.user_id || '0');
      
      if (!user_id) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const kycApplication = await this.kycModel.findOne({
        where: { user_id },
        include: [
          {
            model: this.userModel,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
          }
        ]
      });

      if (!kycApplication) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'KYC application not found'
        });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: { kycApplication }
      });
    } catch (error) {
      console.error('Error fetching user KYC application:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch KYC application'
      });
    }
  };

  // Get KYC status for authenticated user
  getKYCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      // Get user_id from authenticated user (site user)
      const user_id = parseInt((req.user as any)?.user_id || '0');
      
      if (!user_id) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const kycApplication = await this.kycModel.findOne({
        where: { user_id },
        attributes: ['id', 'status', 'createdAt', 'updatedAt']
      });

      if (!kycApplication) {
        res.status(HttpStatusCode.OK).json({
          success: true,
          data: { status: 'not_submitted' }
        });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: { 
          status: kycApplication.status,
          id: kycApplication.id,
          createdAt: kycApplication.createdAt,
          updatedAt: kycApplication.updatedAt
        }
      });
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch KYC status'
      });
    }
  };

  // Update KYC application status
  updateKYCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!['pending', 'verified', 'rejected'].includes(status)) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Invalid status. Must be pending, verified, or rejected'
        });
        return;
      }

      const kycApplication = await this.kycModel.findByPk(id);

      if (!kycApplication) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'KYC application not found'
        });
        return;
      }

      // Update status
      await kycApplication.update({ status });

      // Send email notification if status is verified
      if (status === 'verified') {
        console.log("🔍 KYC Status is 'verified' - attempting to send email...");
        try {
          // Get user details
          const user = await this.userModel.findByPk(kycApplication.user_id);
          console.log("🔍 User found:", user ? `${user.email} (ID: ${user.id})` : "NOT FOUND");
          
          if (user) {
            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
            console.log("🔍 User name:", userName);
            
            // Get KYC verification email template
            const emailTemplate = await EmailTemplateService.getKYCVerificationEmail(
              user.email,
              userName
            );
            console.log("🔍 Email template:", emailTemplate ? "FOUND" : "NOT FOUND");
            
            if (emailTemplate) {
              console.log("📧 Sending KYC verification email...");
              await sendMail(user.email, emailTemplate.subject, emailTemplate.body);
              console.log(`✅ KYC verification email sent to: ${user.email}`);
            } else {
              console.error('❌ KYC verification email template not found');
            }
          } else {
            console.error('❌ User not found for KYC application:', kycApplication.user_id);
          }
        } catch (emailError) {
          console.error('❌ Failed to send KYC verification email:', emailError);
          // Don't fail the status update if email fails
        }
      } else {
        console.log("🔍 KYC Status is not 'verified' - no email will be sent. Status:", status);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: { kycApplication },
        message: 'KYC status updated successfully'
      });
    } catch (error) {
      console.error('Error updating KYC status:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update KYC status'
      });
    }
  };

  // Delete KYC application
  deleteKYCApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const { id } = req.params;

      const kycApplication = await this.kycModel.findByPk(id);

      if (!kycApplication) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: 'KYC application not found'
        });
        return;
      }

      // Delete the KYC application
      await kycApplication.destroy();

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'KYC application deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting KYC application:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete KYC application'
      });
    }
  };

  // Get KYC statistics
  getKYCStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const totalApplications = await this.kycModel.count();
      const pendingApplications = await this.kycModel.count({ where: { status: 'pending' } });
      const verifiedApplications = await this.kycModel.count({ where: { status: 'verified' } });
      const rejectedApplications = await this.kycModel.count({ where: { status: 'rejected' } });

      // Calculate weekly percentage changes (7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const pendingApplications7DaysAgo = await this.kycModel.count({
        where: {
          status: 'pending',
          createdAt: {
            [Op.lte]: sevenDaysAgo
          }
        }
      });

      // Calculate percentage change (growth in last 7 days)
      const pendingApplicationsChange = pendingApplications7DaysAgo > 0 ? 
        ((pendingApplications - pendingApplications7DaysAgo) / pendingApplications7DaysAgo * 100) : 
        (pendingApplications > 0 ? 100 : 0);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          total: totalApplications,
          pending: pendingApplications,
          verified: verifiedApplications,
          rejected: rejectedApplications,
          pendingChange: Math.round(pendingApplicationsChange * 100) / 100
        }
      });
    } catch (error) {
      console.error('Error fetching KYC stats:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch KYC statistics'
      });
    }
  };
}
