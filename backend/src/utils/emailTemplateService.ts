import db from "./database";

export interface EmailTemplateData {
  id: number;
  type: string;
  subject: string;
  body: string;
  created_by: number;
  updated_by: number;
  createdAt: Date;
  updatedAt: Date;
}

export class EmailTemplateService {
  private static emailTemplateModel = db.EmailTemplate;

  /**
   * Get email template by type
   */
  static async getTemplateByType(type: string): Promise<EmailTemplateData | null> {
    try {
      const template = await this.emailTemplateModel.findOne({
        where: { type }
      });
      return template ? template.toJSON() as EmailTemplateData : null;
    } catch (error) {
      console.error(`Error fetching email template for type ${type}:`, error);
      return null;
    }
  }

  /**
   * Replace template variables with actual values
   */
  static replaceTemplateVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key];
      
      // Handle different value types
      if (typeof value === 'number') {
        result = result.replace(new RegExp(placeholder, 'g'), value.toFixed(2));
      } else {
        result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
      }
    });
    
    return result;
  }

  /**
   * Get formatted buy confirmation email
   */
  static async getBuyConfirmationEmail(
    userEmail: string,
    companyName: string,
    quantity: number,
    price: number,
    totalAmount: number
  ): Promise<{ subject: string; body: string } | null> {
    try {
      const template = await this.getTemplateByType('Buy_Order_Success');
      if (!template) {
        console.error('Buy order template not found');
        return null;
      }

      const variables = {
        userEmail,
        companyName,
        quantity,
        price: price.toFixed(2),
        totalAmount: totalAmount.toFixed(2)
      };

      const formattedBody = this.replaceTemplateVariables(template.body, variables);
      const formattedSubject = this.replaceTemplateVariables(template.subject, variables);

      return {
        subject: formattedSubject,
        body: formattedBody
      };
    } catch (error) {
      console.error('Error generating buy confirmation email:', error);
      return null;
    }
  }

  /**
   * Get formatted sell confirmation email
   */
  static async getSellConfirmationEmail(
    userEmail: string,
    companyName: string,
    quantity: number,
    sellingPrice: number,
    totalAmount: number,
    message?: string
  ): Promise<{ subject: string; body: string } | null> {
    try {
      const template = await this.getTemplateByType('Sell_Order_Success');
      if (!template) {
        console.error('Sell order template not found');
        return null;
      }

      const variables = {
        userEmail,
        companyName,
        quantity,
        sellingPrice: sellingPrice.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        message: message || ''
      };

      let formattedBody = this.replaceTemplateVariables(template.body, variables);
      
      // Handle conditional message section
      if (!message) {
        // Remove the message section if no message provided
        formattedBody = formattedBody.replace(/{{#if message}}[\s\S]*?{{\/if}}/g, '');
      } else {
        // Replace handlebars-style conditionals with actual content
        formattedBody = formattedBody.replace(/{{#if message}}/g, '');
        formattedBody = formattedBody.replace(/{{\/if}}/g, '');
      }

      const formattedSubject = this.replaceTemplateVariables(template.subject, variables);

      return {
        subject: formattedSubject,
        body: formattedBody
      };
    } catch (error) {
      console.error('Error generating sell confirmation email:', error);
      return null;
    }
  }

  /**
   * Get formatted email verification email
   */
  static async getEmailVerificationEmail(
    email: string,
    otpCode: string
  ): Promise<{ subject: string; body: string } | null> {
    try {
      const template = await this.getTemplateByType('Email_Verification');
      if (!template) {
        console.error('Email verification template not found');
        return null;
      }

      const variables = {
        email,
        otpCode
      };

      const formattedBody = this.replaceTemplateVariables(template.body, variables);
      const formattedSubject = this.replaceTemplateVariables(template.subject, variables);

      return {
        subject: formattedSubject,
        body: formattedBody
      };
    } catch (error) {
      console.error('Error generating email verification email:', error);
      return null;
    }
  }

  /**
   * Get formatted admin purchase notification email
   */
  static async getAdminPurchaseNotificationEmail(
    userEmail: string,
    userName: string,
    companyName: string,
    quantity: number,
    price: number,
    totalAmount: number
  ): Promise<{ subject: string; body: string } | null> {
    try {
      const template = await this.getTemplateByType('Admin_Purchase_Notification');
      if (!template) {
        console.error('Admin purchase notification template not found');
        return null;
      }

      const variables = {
        userEmail,
        userName,
        companyName,
        quantity,
        price: price.toFixed(2),
        totalAmount: totalAmount.toFixed(2)
      };

      const formattedBody = this.replaceTemplateVariables(template.body, variables);
      const formattedSubject = this.replaceTemplateVariables(template.subject, variables);

      return {
        subject: formattedSubject,
        body: formattedBody
      };
    } catch (error) {
      console.error('Error generating admin purchase notification email:', error);
      return null;
    }
  }

  static async getPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetLink: string
  ): Promise<{ subject: string; body: string } | null> {
    try {
      const template = await this.getTemplateByType('Password_Reset');
      if (!template) {
        console.error('Password reset template not found');
        return null;
      }

      const variables = {
        userEmail,
        userName,
        resetLink
      };

      const formattedBody = this.replaceTemplateVariables(template.body, variables);
      const formattedSubject = this.replaceTemplateVariables(template.subject, variables);

      return {
        subject: formattedSubject,
        body: formattedBody
      };
    } catch (error) {
      console.error('Error generating password reset email:', error);
      return null;
    }
  }
}
