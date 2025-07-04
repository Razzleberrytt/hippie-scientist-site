import express from "express";
import { z } from "zod";
import storage from "./storage";
import { insertNewsletterSchema, insertContactSchema } from "@shared/schema";

const router = express.Router();

// Products
router.get("/products", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get("/products/category/:category", async (req, res) => {
  try {
    const products = await storage.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
});

// Reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await storage.getReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/reviews/product/:productId", async (req, res) => {
  try {
    const reviews = await storage.getReviewsByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product reviews" });
  }
});

// FAQ
router.get("/faqs", async (req, res) => {
  try {
    const faqs = await storage.getFAQs();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// Newsletter
router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const data = insertNewsletterSchema.parse(req.body);
    const newsletter = await storage.subscribeNewsletter(data.email);
    res.json(newsletter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    res.status(500).json({ error: "Failed to subscribe to newsletter" });
  }
});

// Contact
router.post("/contact", async (req, res) => {
  try {
    const data = insertContactSchema.parse(req.body);
    const contact = await storage.submitContact(data);
    res.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid contact form data" });
    }
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

export default router;
