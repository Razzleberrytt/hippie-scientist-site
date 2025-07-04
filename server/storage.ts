import { Product, Review, FAQ, Newsletter, Contact } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  // Reviews
  getReviews(): Promise<Review[]>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  
  // FAQ
  getFAQs(): Promise<FAQ[]>;
  
  // Newsletter
  subscribeNewsletter(email: string): Promise<Newsletter>;
  
  // Contact
  submitContact(contact: Omit<Contact, 'id' | 'submittedAt'>): Promise<Contact>;
}

class MemStorage implements IStorage {
  private products: Product[] = [
    {
      id: "1",
      name: "Purple Enhanced Gummies - Strawberry",
      description: "A convenient 5-pack of 3000mg gummies in a discreet, resealable pouch. Each pack contains a potent 3000mg of pure extract! Vegan and gluten-free.",
      price: 49.99,
      category: "enhanced-gummies",
      features: ["Vegan", "Gluten Free", "3000mg", "5-pack"],
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop",
      potency: "3000mg per pack",
      quantity: 5,
      inStock: true,
    },
    {
      id: "2",
      name: "Purple Enhanced Gummies - Watermelon",
      description: "Premium watermelon flavored enhanced gummies. Each gummy contains 600mg of our proprietary mushroom extract blend.",
      price: 49.99,
      category: "enhanced-gummies",
      features: ["Vegan", "Gluten Free", "3000mg", "5-pack"],
      image: "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=800&h=600&fit=crop",
      potency: "3000mg per pack",
      quantity: 5,
      inStock: true,
    },
    {
      id: "3",
      name: "Cannadelics Gummies - Mixed Berry",
      description: "Purple Cannadelic Microdose Gummies come in a 10ct resealable pouch. Each gummy contains a 600mg proprietary blend of THC-V and Magic Mushrooms!",
      price: 79.99,
      category: "cannadelics",
      features: ["Organic", "Low Sugar", "600mg per gummy", "10-count"],
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop",
      potency: "600mg per gummy",
      quantity: 10,
      inStock: true,
    },
    {
      id: "4",
      name: "Silly Dots Hero Dose - 1800mg",
      description: "Our Silly Dots represent the most potent form of edible available. Each tab is infused with 1800mg of our exclusive mushroom extract blend!",
      price: 149.99,
      category: "silly-dots",
      features: ["Hero Dose", "Premium", "1800mg", "3 tabs"],
      image: "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=800&h=600&fit=crop",
      potency: "1800mg per tab",
      quantity: 3,
      inStock: true,
    },
    {
      id: "5",
      name: "Silly Dots Mega Dose - 1200mg",
      description: "Perfect for experienced users. Each tab contains 1200mg of our exclusive mushroom extract blend with powerful nootropics.",
      price: 99.99,
      category: "silly-dots",
      features: ["Mega Dose", "Premium", "1200mg", "2 tabs"],
      image: "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=800&h=600&fit=crop",
      potency: "1200mg per tab",
      quantity: 2,
      inStock: true,
    },
  ];

  private reviews: Review[] = [
    {
      id: "1",
      customerName: "Jason Casey",
      rating: 5,
      comment: "Silly tabs are my favorite. They work !!!",
      date: "2025-07-03",
      productId: "1",
      verified: true,
    },
    {
      id: "2",
      customerName: "A",
      rating: 5,
      comment: "Damn these are actually potent. Fantastically fun!",
      date: "2025-06-27",
      productId: "4",
      verified: true,
    },
    {
      id: "3",
      customerName: "Eric Hernandez",
      rating: 5,
      comment: "Great times! Definitely helped me break through my writers block. Would recommend!",
      date: "2025-06-20",
      productId: "5",
      verified: true,
    },
    {
      id: "4",
      customerName: "Jessica Necaise",
      rating: 5,
      comment: "Would highly recommend, I take 3 at a time and it's a blast!!!!",
      date: "2025-06-19",
      productId: "1",
      verified: true,
    },
    {
      id: "5",
      customerName: "Joseph Morrissey",
      rating: 5,
      comment: "Silly dotz are an absolute blast. My go to whenever I want to go on a fun trip.",
      date: "2025-06-11",
      productId: "5",
      verified: true,
    },
    {
      id: "6",
      customerName: "Amiee",
      rating: 5,
      comment: "Perfectly pleased! Great overall experience with purchase and shipping and great product!",
      date: "2025-07-01",
      productId: "1",
      verified: true,
    },
  ];

  private faqs: FAQ[] = [
    {
      id: "1",
      question: "How can I contact Purple Co?",
      answer: "We're here to help you with anything you need! Send us an email at customerservice@purple-co.com.",
      order: 1,
    },
    {
      id: "2",
      question: "How long will delivery take?",
      answer: "3-5 business days, not including Sundays and holidays. We ship using USPS First Class, and shipping varies from state to state. Once your order is shipped out, we'll send you a tracking number via email for an exact timeline.",
      order: 2,
    },
    {
      id: "3",
      question: "How strong are these?",
      answer: "Think of each gummy as the equivalent of 1/2 gram of caps. A true Microdose would be considered 1/2-1 of a gummy. Each pack contains 4g of equivalent effects to dried caps.",
      order: 3,
    },
    {
      id: "4",
      question: "What States do you deliver to?",
      answer: "Purple Gummies are currently available for delivery to all 50 states in the US.",
      order: 4,
    },
    {
      id: "5",
      question: "Are your products vegan/vegetarian-friendly?",
      answer: "Our products are vegan-friendly and do not contain any animal-derived ingredients.",
      order: 5,
    },
    {
      id: "6",
      question: "Can I change or cancel my order after it has been placed?",
      answer: "Once an order has been placed, changes or cancellations may not be possible due to our quick processing times. Please contact us immediately at customerservice@purple-co.com if you need assistance with your order.",
      order: 6,
    },
  ];

  private newsletters: Newsletter[] = [];
  private contacts: Contact[] = [];

  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  async getReviews(): Promise<Review[]> {
    return this.reviews;
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.productId === productId);
  }

  async getFAQs(): Promise<FAQ[]> {
    return this.faqs.sort((a, b) => a.order - b.order);
  }

  async subscribeNewsletter(email: string): Promise<Newsletter> {
    const newsletter: Newsletter = {
      id: Date.now().toString(),
      email,
      subscribedAt: new Date().toISOString(),
    };
    this.newsletters.push(newsletter);
    return newsletter;
  }

  async submitContact(contact: Omit<Contact, 'id' | 'submittedAt'>): Promise<Contact> {
    const fullContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
    };
    this.contacts.push(fullContact);
    return fullContact;
  }
}

export default new MemStorage();
