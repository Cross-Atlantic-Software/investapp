import { sequelizePromise, db } from '../utils/database';

// Stock data based on simplified 7-field structure
// Fields: company_name, logo, price, price_change, teaser, short_description, analysis
const sampleStocks = [
  {
    company_name: 'TCS',
    logo: 'https://my-cross-stock-icons.s3.ap-south-1.amazonaws.com/icons/1758292407120-tcs.png',
    price: 35.00,
    price_change: 2.90,
    teaser: 'Leading IT services company with strong market presence',
    short_description: 'Tata Consultancy Services (TCS) is a multinational information technology services and consulting company headquartered in Mumbai, India. It is a subsidiary of the Tata Group and operates in 149 locations across 46 countries.',
    analysis: 'TCS has demonstrated consistent growth in the IT services sector with strong fundamentals. The company has a robust client base across various industries and continues to invest in digital transformation technologies. Recent performance shows positive momentum with increasing demand for cloud services and digital solutions. The company maintains strong financial health with good cash flow and dividend payments. Market analysts view TCS as a stable investment with potential for long-term growth in the expanding IT services market.'
  }
];

async function seedStocks() {
  try {
    console.log('🌱 Starting stock seeding...');
    
    // Wait for database connection
    const sequelize = await sequelizePromise;
    console.log('✅ Database connected');
    
    // Clear existing stocks (optional - remove this if you want to keep existing data)
    await db.Product.destroy({ where: {} });
    console.log('🗑️ Cleared existing stocks');
    
    // Insert sample stocks
    for (const stock of sampleStocks) {
      await db.Product.create(stock);
      console.log(`✅ Added stock: ${stock.company_name}`);
    }
    
    console.log('🎉 Stock seeding completed successfully!');
    console.log(`📊 Total stocks added: ${sampleStocks.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding stocks:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the seeding function
seedStocks();
