const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Helper: Random số nguyên trong khoảng
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Random phần tử từ mảng
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log("Starting seeding process...");

  // 1. XÓA DỮ LIỆU CŨ (CLEAN DATABASE)
  console.log("Cleaning database...");
  await prisma.chatMessage.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.qnA.deleteMany();
  await prisma.watchList.deleteMany();
  await prisma.bannedBidder.deleteMany();
  await prisma.bidHistory.deleteMany();
  await prisma.autoBid.deleteMany();
  await prisma.sellerUpgradeRequest.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();

  // 2. TẠO USERS
  console.log("Creating users...");
  const passwordHash = await bcrypt.hash("12345678", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      full_name: "Super Admin",
      email: "ltphu.dev+admin@gmail.com",
      password_hash: passwordHash,
      role: "Admin",
      is_email_verified: true,
      address: "123 Admin St, New York, USA",
    },
  });

  // Sellers
  const sellers = [];
  const sellerNames = ["John Seller", "Alice Merchant", "Bob Retailer"];
  for (let i = 0; i < 3; i++) {
    const s = await prisma.user.create({
      data: {
        full_name: sellerNames[i],
        email: `ltphu.dev+seller${i + 1}@gmail.com`,
        password_hash: passwordHash,
        role: "Seller",
        is_email_verified: true,
        address: `Shop ${i + 1}, Business District`,
        rating_plus: randomInt(10, 50),
        rating_minus: randomInt(0, 2),
      },
    });
    sellers.push(s);
  }

  // Bidders
  const bidders = [];
  const bidderNames = [
    "Tom Bidder",
    "Jerry Buyer",
    "Mickey Collector",
    "Donald Hunter",
    "Goofy Spender",
    "Pluto Watcher",
    "Daisy Lover",
    "Minnie Fan",
    "Peter Pan",
    "Captain Hook",
  ];
  for (let i = 0; i < 10; i++) {
    const b = await prisma.user.create({
      data: {
        full_name: bidderNames[i],
        email: `ltphu.dev+bidder${i + 1}@gmail.com`,
        password_hash: passwordHash,
        role: "Bidder",
        is_email_verified: true,
        address: `House ${i + 1}, Residential Area`,
        rating_plus: randomInt(0, 20),
      },
    });
    bidders.push(b);
  }

  // 3. TẠO CATEGORIES
  console.log("Creating categories...");

  const electronics = await prisma.category.create({
    data: { name: "Electronics", description: "Gadgets and devices" },
  });
  const smartphones = await prisma.category.create({
    data: { name: "Smartphones", parent_id: electronics.id },
  });
  const laptops = await prisma.category.create({
    data: { name: "Laptops", parent_id: electronics.id },
  });

  const fashion = await prisma.category.create({
    data: { name: "Fashion", description: "Clothing and accessories" },
  });
  const watches = await prisma.category.create({
    data: { name: "Watches", parent_id: fashion.id },
  });
  const sneakers = await prisma.category.create({
    data: { name: "Sneakers", parent_id: fashion.id },
  });

  const collectibles = await prisma.category.create({
    data: { name: "Collectibles", description: "Rare items and art" },
  });
  const art = await prisma.category.create({
    data: { name: "Art", parent_id: collectibles.id },
  });

  const others = await prisma.category.create({
    data: { name: "Others", description: "Miscellaneous items" },
  });

  // 4. TẠO SẢN PHẨM
  console.log("Creating products...");

  // Cấu trúc mới: `images` là một mảng chuỗi chứa 3 URL khác nhau
  const productTemplates = [
    // Smartphones
    {
      name: "iPhone 15 Pro Max 256GB",
      cat: smartphones,
      images: [
        "https://qkm.vn/wp-content/uploads/2024/07/iphone-15-pro-128gb-256gb-512gb-1tb-cu-like-new-99-qkm-1.jpg",
        "https://goka.vn/wp-content/uploads/2023/09/Iphone_15promax_white-1024x1024.jpg",
        "https://rauvang.com/data/Product/iphone-15-pro-finish-select-202309-6-7inch-bluetitanium.htm_1694830852.jpg",
      ],
      price: 1000.0,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      cat: smartphones,
      images: [
        "https://cdn.tgdd.vn/Products/Images/42/307174/Slider/samsung-galaxy-s24-ultra-5g-thumb-youtube-1020x570.jpg",
        "https://images.samsung.com/vn/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-color-titanium-blue-back-mo.jpg?imbypass=true",
        "https://bachlongstore.vn/vnt_upload/product/01_2024/76083.png",
      ],
      price: 1100.0,
    },
    {
      name: "Google Pixel 8 Pro",
      cat: smartphones,
      images: [
        "https://cdn.tgdd.vn/Files/2022/06/27/1442878/pixel8promanhinh-051023-083530-800-resize.jpeg",
        "https://hips.hearstapps.com/hmg-prod/images/google-pixel-8-pro-lead-jpg-66aded713e801.jpg?crop=0.666875xw:1xh;center,top&resize=1200:*",
        "https://i.insider.com/65cfbe826fcb546d2d50f6cc?width=700",
      ],
      price: 900.0,
    },

    // Laptops
    {
      name: "MacBook Pro M3 14-inch",
      cat: laptops,
      images: [
        "https://onewaymobile.vn/upload_images/images/2024/07/30/macbook-pro-14-m3-8gb-1tb-thiet-ke-gon-nhe.jpg",
        "https://product.hstatic.net/200000768357/product/macbook_pro_m3_silver_e0dfd8c2954c42499140d9cde2422585.png",
        "https://laptoptld.com/wp-content/uploads/2023/10/8.png",
      ],
      price: 1500.0,
    },
    {
      name: "Dell XPS 15 9530",
      cat: laptops,
      images: [
        "https://tramanh.vn/wp-content/uploads/2023/09/dell-xps-15-9530-2023-3.jpg",
        "https://laptopxachtay.com.vn/Images/Products/dell-xps-15-9530-i9-13900h-64gb-1tb-ssd-rtx4070-8gb-15-6-oled-3-5k-win-11-_40600_2.jpg?",
        "https://no1computer.vn/images/products/2022/08/01/large/dell-xps-9315-2022-4-_1659325442.jpeg",
      ],
      price: 1400.0,
    },
    {
      name: "Asus ROG Zephyrus G14",
      cat: laptops,
      images: [
        "https://mac24h.vn/images/companies/1/Asus/ASUS%20ROG%20Zephyrus%20G15/G14/G14%202024/170728681833.jpg?1711081856623",
        "https://laptopaz.vn/media/product/2676_thi___t_k____ch__a_c___t__n__2_.png",
        "https://dlcdnwebimgs.asus.com/gain/E90DE227-7002-48C1-A940-B6E952D0BCCC",
      ],
      price: 1300.0,
    },

    // Watches
    {
      name: "Rolex Submariner Date",
      cat: watches,
      images: [
        "https://media.rolex.com/image/upload/q_auto:eco/f_auto/t_v7-majesty/c_limit,w_1920/v1/catalogue/2025/upright-c/m126610ln-0001.jpg",
        "https://img.chrono24.com/images/uhren/43286104-z6th4amcv0pih58qsc8ad7r7-ExtraLarge.jpg",
        "https://img.chrono24.com/images/uhren/42800842-3gsta1z2bdb4i9rbyn21lell-ExtraLarge.jpg",
      ],
      price: 8000.0,
    },
    {
      name: "Omega Speedmaster Moonwatch",
      cat: watches,
      images: [
        "https://luxewatch.vn/wp-content/uploads/2023/02/Dong-Ho-Omega-Speedmaster-Moonwatch-Co-Axial-310.30.42.50.01.002-Cu03.jpg",
        "https://onetime.vn/wp-content/uploads/2022/07/omega-1-2.jpg",
        "https://cdn.luxshopping.vn/Thumnails/Uploads/News/omega-speedmaster-311-30-42-30-01-005-moonwatch-422.png_980_980.webp",
      ],
      price: 5000.0,
    },
    {
      name: "Seiko 5 Sports Automatic",
      cat: watches,
      images: [
        "https://cdn.luxshopping.vn/Thumnails/Uploads/News/seiko-5-sports-automatic-green-dial-watch-42-5mm.jpg_980_980.webp",
        "https://bizweb.dktcdn.net/100/423/012/products/ssk035k1-ssk035-6.jpg?v=1745037231157",
        "https://image.donghohaitrieu.com/wp-content/uploads/2024/08/SRPK29K13.jpg",
      ],
      price: 250.0,
    },
    {
      name: "Casio G-Shock Mudmaster",
      cat: watches,
      images: [
        "https://product.hstatic.net/1000223154/product/246de1d939d0df8e86c1__1__39406a36c1f5474a82b50ca25e49bda0_maste_2c3841e7453044b1a8591075d0b6057d_master.jpg",
        "https://www.casio.com/content/dam/casio/product-info/locales/vn/vi/timepiece/product/watch/G/GG/GG1/GG-1000-1A5/assets/GG-1000-1A5_Seq1.png.transform/main-visual-sp/image.png",
        "https://www.casio.com/content/dam/casio/product-info/locales/in/en/timepiece/product/watch/G/GG/GGB/GG-B100-1A3/assets/GG-B100-1A3_Seq3.jpg.transform/main-visual-sp/image.jpg",
      ],
      price: 300.0,
    },

    // Sneakers
    {
      name: "Nike Air Jordan 1 High OG",
      cat: sneakers,
      images: [
        "https://bizweb.dktcdn.net/thumb/1024x1024/100/467/909/products/giay-nike-air-jordan-1-retro-hig-1.jpg?v=1722760465953",
        "https://cdn.vuahanghieu.com/unsafe/0x0/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/news/content/2021/10/nike-air-jordan-1-retro-high-white-university-blue-555088-1-png-1634645819-19102021191659.png",
        "https://sneakerdaily.vn/wp-content/uploads/2021/01/Giay-nam-Air-Jordan-1-High-OG-University-Blue-555088-134-1.jpg",
      ],
      price: 180.0,
    },
    {
      name: "Adidas Yeezy Boost 350",
      cat: sneakers,
      images: [
        "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/f16e1e8d6933d6db4356bfe02e6acfc7.jpeg&format=jpeg",
        "https://rollsneaker.vn/wp-content/uploads/2022/09/Yeezy-350-Cream-White.jpg",
        "https://kingshoes.vn/data/upload/media/giay-adidas-yeezy-boost-350-v2-cream-white-chnh-hng-tphcm-cp9366-king-shoes-sneaker-real-tan-binh-2.jpg",
      ],
      price: 220.0,
    },
    {
      name: "New Balance 990v6",
      cat: sneakers,
      images: [
        "https://authentic-shoes.com/wp-content/uploads/2023/09/Screenshot_2023.09.12_17.44.11.182.png",
        "https://cdn.webshopapp.com/shops/159677/files/473305668/2000x2500x1/new-balance-made-in-usa-990v6-black-white.jpg",
        "https://thepremierstore.com/cdn/shop/files/6-1-23-NewBalance-990-Black-1.jpg?v=1685635108",
      ],
      price: 200.0,
    },

    // Art
    {
      name: "Abstract Oil Painting 'Chaos'",
      cat: art,
      images: [
        "https://plus.unsplash.com/premium_photo-1726880487806-e4da33590cb4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1618913001600-4284b12e1623?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1618913001611-2054733f4aa8?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      price: 500.0,
    },
    {
      name: "Vintage Film Poster 1980s",
      cat: art,
      images: [
        "https://images.unsplash.com/photo-1587555009307-4b73aaab7d9c?q=80&w=683&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1584445743187-cd8ba040349a?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1709985532713-0dc8866bda55?q=80&w=704&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      price: 150.0,
    },
    {
      name: "Handmade Ceramic Vase",
      cat: art,
      images: [
        "https://plus.unsplash.com/premium_photo-1668620538983-c5993e4a443d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1656626277991-0fd06ae52d5c?q=80&w=729&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1723717275425-eb4a16b5d2da?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      price: 80.0,
    },

    // Others
    {
      name: "Sony WH-1000XM5 Headphones",
      cat: others,
      images: [
        "https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1719312515-1693908427-xm5-64f6fdba380ae.png?crop=1xw:1.00xh;center,top&resize=980:*",
        "https://songlongmedia.com/media/product/3123_tai_nghe_sony_wh_1000xm5_blue_songlongmedia.png",
        "https://m.media-amazon.com/images/I/61miTn7NQHL.jpg",
      ],
      price: 350.0,
    },
    {
      name: "Dyson V15 Detect Vacuum",
      cat: others,
      images: [
        "https://product.hstatic.net/200000661969/product/hut-bui-dyson-v15-detect-absolute-plus-l514k_cb98e91113e842a6bbb2a51649374a19.jpg",
        "https://m.media-amazon.com/images/I/61DdUtryrML._AC_UF894,1000_QL80_.jpg",
        "https://www.droidshop.vn/wp-content/uploads/2024/07/May-hut-bui-Dyson-V15-1.jpg",
      ],
      price: 700.0,
    },
    {
      name: "PlayStation 5 Console",
      cat: others,
      images: [
        "https://hanoicomputercdn.com/media/lib/06-01-2025/may-choi-game-sony-playstation-5-ps5-slim-console-30th-anniversary-limited-edition8.jpg",
        "https://www.droidshop.vn/wp-content/uploads/2022/02/May-choi-game-PS5-Digital-Edition-Console-1.jpg",
        "https://i5.walmartimages.com/seo/PlayStation-5-Slim-PS5-Console-Digital-Edition-Video-Game-Built-in-1TB-SSD-Storage-Bundle-Extra-Sony-PS-5-DualSense-Wireless-Play-Station-Controller_c6582094-12d7-4fa5-807d-1cb9c6de2c08.68256721dc5dce5daf033489e8e7437e.jpeg",
      ],
      price: 450.0,
    },
    {
      name: "Kindle Paperwhite Signature",
      cat: others,
      images: [
        "https://helios-i.mashable.com/imagery/reviews/03Ozd6oIKkwasAUWeAiiqtD/hero-image.fill.size_1248x702.v1636129211.jpg",
        "https://m.media-amazon.com/images/I/61RQGd9QuQL._AC_UF894,1000_QL80_.jpg",
        "https://akishop.com.vn/mediacenter/media/1453/files/fffff.jpg",
      ],
      price: 140.0,
    },
  ];

  for (const template of productTemplates) {
    const isEnded = Math.random() > 0.5;
    const createdAt = new Date();
    const endTime = isEnded
      ? new Date(Date.now() - 1000 * 60 * 60 * 24 * randomInt(1, 10))
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * randomInt(1, 7));

    const startPrice = template.price * 0.7;
    const stepPrice = Math.max(10, Math.floor(template.price * 0.05));
    const buyNowPrice = template.price * 1.5;

    // Không cần tạo mảng ảnh tự động nữa vì đã có sẵn trong template
    // const numImages = randomInt(3, 5);
    // const productImages = Array.from({ length: numImages }, (_, i) => `${template.img}&i=${i}`);

    const descriptionHTML = `
      <h2>Product Overview</h2>
      <p>This is a <strong>${template.name}</strong> in excellent condition. Perfect for collectors and enthusiasts.</p>
      <ul>
        <li>100% Authentic</li>
        <li>Original packaging included</li>
        <li>Warranty available</li>
      </ul>
      <p>Don't miss out on this exclusive item!</p>
    `;

    const product = await prisma.product.create({
      data: {
        name: template.name,
        description: descriptionHTML,
        images: template.images, // Sử dụng mảng ảnh được định nghĩa thủ công
        start_price: startPrice,
        step_price: stepPrice,
        buy_now_price: buyNowPrice,
        current_price: startPrice,
        created_at: createdAt,
        end_time: endTime,
        status: "Active",
        auto_renew: true,
        seller_id: randomItem(sellers).id,
        category_id: template.cat.id,
      },
    });

    // 5. TẠO LỊCH SỬ ĐẤU GIÁ
    const numberOfBids = randomInt(0, 8);
    let currentBidPrice = startPrice;
    let winnerId = null;

    if (numberOfBids > 0) {
      for (let j = 0; j < numberOfBids; j++) {
        const bidder = randomItem(bidders);
        const bidAmount = currentBidPrice + stepPrice;
        currentBidPrice = bidAmount;
        const bidTime = new Date(createdAt.getTime() + j * 1000 * 60 * 60);

        await prisma.bidHistory.create({
          data: {
            bid_price: bidAmount,
            created_at: bidTime,
            user_id: bidder.id,
            product_id: product.id,
          },
        });

        const maxPrice = bidAmount + stepPrice * randomInt(1, 5);
        await prisma.autoBid.upsert({
          where: {
            user_id_product_id: { user_id: bidder.id, product_id: product.id },
          },
          update: { max_price: maxPrice, created_at: bidTime },
          create: {
            user_id: bidder.id,
            product_id: product.id,
            max_price: maxPrice,
            created_at: bidTime,
          },
        });

        winnerId = bidder.id;
      }
    }

    // --- LOGIC TRẠNG THÁI ---
    let finalStatus = "Active";

    if (isEnded) {
      if (winnerId) {
        finalStatus = "Won";
      } else {
        finalStatus = "Expired";
      }
    }

    // Cập nhật Product
    await prisma.product.update({
      where: { id: product.id },
      data: {
        current_price: currentBidPrice,
        current_bidder_id: winnerId,
        bid_count: numberOfBids,
        status: finalStatus,
      },
    });

    // --- LOGIC GIAO DỊCH & ĐÁNH GIÁ (Chỉ khi Won) ---
    if (finalStatus === "Won" && winnerId) {
      const transaction = await prisma.transaction.create({
        data: {
          product_id: product.id,
          winner_id: winnerId,
          seller_id: product.seller_id,
          final_price: currentBidPrice,
          status: "PendingPayment",
          created_at: endTime,
        },
      });

      const isCompleted = Math.random() > 0.4;

      if (isCompleted) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "Completed",
            shipping_address: "123 Seed Street, Mock City",
            payment_invoice_url: "https://example.com/invoice.pdf",
            seller_confirmed_at: new Date(),
            buyer_confirmed_at: new Date(),
          },
        });

        await prisma.product.update({
          where: { id: product.id },
          data: { status: "Sold" },
        });

        await prisma.rating.create({
          data: {
            transaction_id: transaction.id,
            rater_id: product.seller_id,
            rated_user_id: winnerId,
            score: "Positive",
            comment: "Excellent buyer, fast payment!",
            created_at: new Date(),
          },
        });

        await prisma.rating.create({
          data: {
            transaction_id: transaction.id,
            rater_id: winnerId,
            rated_user_id: product.seller_id,
            score: "Positive",
            comment: "Item arrived exactly as described. A++ seller!",
            created_at: new Date(),
          },
        });
      }
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
