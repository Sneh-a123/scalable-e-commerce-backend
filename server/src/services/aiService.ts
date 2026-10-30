import { Product } from '../models';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export class AiService {
  /**
   * Nexora AI Shopping Assistant / Copilot.
   * Answers product inquiries, recommends gear based on user criteria,
   * compares items, and assists with customer decisions.
   */
  static async askCopilot(query: string, history?: { role: 'user' | 'assistant'; content: string }[]) {
    // 1. Fetch available products to ground the assistant in actual store catalog
    const products = await Product.find({ isArchived: { $ne: true }, stock: { $gt: 0 } })
      .select('title slug price category description tags rating')
      .populate('category', 'name')
      .limit(12)
      .lean();

    const catalogContext = products
      .map(
        (p: any) =>
          `- ${p.title} (${p.category?.name || 'Gadget'}): ₹${p.price}, Rating: ${p.rating}/5. Tags: ${p.tags?.join(', ')}. Details: ${p.description.slice(0, 100)}...`
      )
      .join('\n');

    // 2. If Gemini API key is present, invoke Google Generative Language API
    if (ENV.GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are Nexora AI Copilot, a futuristic Gen-Z tech shopping advisor for the NEXORA e-commerce platform.
Style: Smart, ultra-helpful, concise, tech-savvy, and professional.
Here is the current live store catalog:
${catalogContext}

Answer the user's shopping question. Highlight specific products, prices, or recommendations from the catalog when relevant. Keep responses under 150 words.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }]
                }
              ]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              reply,
              suggestedProducts: products.slice(0, 3).map((p: any) => ({
                id: p._id,
                title: p.title,
                price: p.price,
                slug: p.slug
              })),
              poweredBy: 'Gemini LLM API'
            };
          }
        }
      } catch (err: any) {
        logger.warn(`Gemini API call failed (${err.message}). Using intelligent contextual assistant fallback.`);
      }
    }

    // 3. Fallback: Intelligent catalog-grounded heuristic copilot
    const lower = query.toLowerCase();
    let matchedProducts = products.filter(
      (p: any) =>
        lower.includes(p.title.toLowerCase()) ||
        p.tags?.some((t: string) => lower.includes(t.toLowerCase())) ||
        lower.includes(p.category?.name?.toLowerCase() || '')
    );

    if (matchedProducts.length === 0) {
      matchedProducts = products.slice(0, 3);
    }

    let answer = `Welcome to Nexora! I analyzed our live catalog. `;
    if (lower.includes('recommend') || lower.includes('best') || lower.includes('suggest')) {
      const top = matchedProducts[0] || products[0];
      answer += `Based on performance and customer ratings, our top pick right now is the **${top.title}** (₹${top.price}). It boasts a ${top.rating}/5 rating and cutting-edge engineering.`;
    } else if (lower.includes('cheap') || lower.includes('budget') || lower.includes('price')) {
      const budget = [...products].sort((a, b) => a.price - b.price)[0];
      answer += `For best value, check out the **${budget.title}** at just ₹${budget.price}. Outstanding specs without breaking the bank.`;
    } else {
      answer += `We have premium gear matching your vibe! Check out the **${matchedProducts[0]?.title}** or ask me about gaming headsets, mechanical keyboards, quantum wearables, and AI accelerators.`;
    }

    return {
      reply: answer,
      suggestedProducts: matchedProducts.slice(0, 3).map((p: any) => ({
        id: p._id,
        title: p.title,
        price: p.price,
        slug: p.slug
      })),
      poweredBy: 'Nexora Catalog Copilot'
    };
  }
}
