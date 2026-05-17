import { sequelizePromise, db } from '../utils/database';

// Stock data based on simplified 7-field structure
// Fields: company_name, logo, price, price_change, teaser, short_description, analysis
const sampleStocks = [
  {
    company_name: 'TCS',
    logo: 'https://my-cross-stock-icons.s3.ap-south-1.amazonaws.com/icons/1758292407120-tcs.png',
    price: 35.00,
    price_change: 2.90,
    teaser: 'Leading IT services company with strong global market presence',
    short_description: 'Tata Consultancy Services (TCS) is a multinational information technology services and consulting company headquartered in Mumbai, India. It is a subsidiary of the Tata Group and operates in 149 locations across 46 countries.',
    analysis: 'TCS has demonstrated consistent growth in the IT services sector with strong fundamentals. The company has a robust client base across various industries and continues to invest in digital transformation technologies. Recent performance shows positive momentum with increasing demand for cloud services and digital solutions.'
  },
  {
    company_name: 'Infosys',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/1280px-Infosys_logo.svg.png',
    price: 18.50,
    price_change: 1.20,
    teaser: 'Global leader in next-generation digital services and consulting',
    short_description: 'Infosys is a global leader in next-generation digital services and consulting. It enables clients in more than 56 countries to navigate their digital transformation with AI-first core, empowering businesses with agile digital at scale.',
    analysis: 'Infosys continues to win large deal contracts and expand its AI and cloud capabilities. The company has strong revenue visibility driven by a healthy deal pipeline. Margin improvement initiatives and efficient capital allocation make it an attractive long-term holding for growth-oriented investors.'
  },
  {
    company_name: 'Reliance Industries',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Reliance_Industries_Logo.svg/1200px-Reliance_Industries_Logo.svg.png',
    price: 29.80,
    price_change: -0.45,
    teaser: 'India\'s largest conglomerate spanning energy, retail, and telecom',
    short_description: 'Reliance Industries Limited is India\'s largest private-sector company with businesses spanning hydrocarbon exploration, petroleum refining, petrochemicals, retail, and digital services through Jio Platforms.',
    analysis: 'Reliance\'s diversified business model provides resilience against sector-specific downturns. The Jio and Retail segments are high-growth drivers, while the traditional energy business provides steady cash flows. The upcoming Jio IPO and new energy investments are potential re-rating catalysts.'
  },
  {
    company_name: 'HDFC Bank',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/1200px-HDFC_Bank_Logo.svg.png',
    price: 16.75,
    price_change: 0.85,
    teaser: 'India\'s largest private sector bank with a strong retail franchise',
    short_description: 'HDFC Bank is India\'s largest private sector bank by assets, offering a wide range of financial products and services including retail banking, wholesale banking, treasury operations, and insurance.',
    analysis: 'HDFC Bank has a proven track record of consistent asset quality management and robust loan growth. Post-merger integration with HDFC Ltd is progressing well, expanding its mortgage portfolio significantly. Strong CASA ratio and improving net interest margins make this a core banking holding.'
  },
  {
    company_name: 'Wipro',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/1200px-Wipro_Primary_Logo_Color_RGB.svg.png',
    price: 5.90,
    price_change: -0.30,
    teaser: 'Global technology services firm accelerating digital transformation',
    short_description: 'Wipro Limited is a leading global information technology, consulting, and business process services company. It leverages the power of cognitive computing, hyper-automation, robotics, cloud, analytics, and emerging technologies to help clients adapt to the digital world.',
    analysis: 'Wipro\'s ongoing strategic restructuring and focus on large deal wins are beginning to show results. The company\'s investment in AI-driven service delivery and strong partnership ecosystem should drive margin expansion. Current valuations offer a margin of safety relative to peers.'
  },
  {
    company_name: 'Bajaj Finance',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bajaj_Finance_logo.svg/1200px-Bajaj_Finance_logo.svg.png',
    price: 78.40,
    price_change: 3.15,
    teaser: 'India\'s most diversified non-banking financial company',
    short_description: 'Bajaj Finance Limited is an Indian non-banking financial company that is engaged in lending and allied activities. The company has a diversified lending portfolio across consumer, SME, and commercial customers.',
    analysis: 'Bajaj Finance continues to outpace industry growth with its superior underwriting, technology-led customer acquisition, and cross-sell capabilities. AUM growth remains strong while credit costs stay manageable. The stock commands premium valuations reflecting best-in-class execution.'
  },
  {
    company_name: 'Asian Paints',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Asian_Paints_Logo.svg/1200px-Asian_Paints_Logo.svg.png',
    price: 32.60,
    price_change: -1.10,
    teaser: 'Market-dominant paint and coatings company with pan-India reach',
    short_description: 'Asian Paints is India\'s largest and Asia\'s third-largest paint company. It operates in 15 countries and has 26 paint manufacturing facilities in the world, serving diverse consumer and industrial coating needs.',
    analysis: 'Asian Paints enjoys unmatched distribution reach and strong brand equity built over decades. Raw material tailwinds and premiumisation trends in the Indian market support margin recovery. Competitive intensity from new entrants is a near-term headwind but the company\'s scale provides a durable moat.'
  },
  {
    company_name: 'Zomato',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Zomato_logo.png/1200px-Zomato_logo.png',
    price: 2.20,
    price_change: 0.18,
    teaser: 'India\'s leading food delivery and quick commerce platform',
    short_description: 'Zomato is an Indian multinational food delivery company offering restaurant discovery, food ordering, and quick commerce services through Blinkit. It operates in over 800 cities across India.',
    analysis: 'Zomato has crossed the profitability milestone ahead of expectations, with both its food delivery and Blinkit quick commerce verticals growing rapidly. Expanding dark store network and increasing order frequency are key growth levers. Regulatory risks and competitive pressure from Swiggy are key monitorables.'
  },
  {
    company_name: 'Tata Motors',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/1200px-Tata_logo.svg.png',
    price: 9.45,
    price_change: 0.62,
    teaser: 'Automotive giant driving India\'s EV revolution and JLR turnaround',
    short_description: 'Tata Motors is a global automotive manufacturer and part of the Tata Group. It produces cars, trucks, vans, coaches, and buses and also owns the iconic Jaguar Land Rover (JLR) brand acquired in 2008.',
    analysis: 'Tata Motors is in a structural transformation story with JLR reporting record profitability and domestic EV market leadership. Debt reduction trajectory and strong order books at JLR underpin the investment thesis. EV incentive policy changes and semiconductor supply risks remain watch points.'
  },
  {
    company_name: 'Adani Ports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adani_2012_logo.svg/1200px-Adani_2012_logo.svg.png',
    price: 13.20,
    price_change: 0.95,
    teaser: 'India\'s largest integrated port and logistics platform',
    short_description: 'Adani Ports and Special Economic Zone (APSEZ) is India\'s largest port developer and operator with a portfolio of 13 domestic and 3 international ports. It handles over 25% of India\'s total cargo traffic.',
    analysis: 'Adani Ports benefits from India\'s expanding trade volumes and infrastructure push. The company\'s logistics integration strategy is creating higher value per cargo unit. Strong operating leverage and consistent cash generation make it a preferred infrastructure play despite broader group-level headline risks.'
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
