import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Interpretation Route
  app.post("/api/interpret", async (req, res) => {
    try {
      const { question, spread, cards } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "AI configuration missing." });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        คุณคือ "อาจารย์โหรา" หมอดูไพ่ยิปซีผู้มีญาณทิพย์และประสบการณ์สูงในประเทศไทย
        ใช้ภาษาไทยที่สละสลวย อบอุ่น มีความขลัง แต่เข้าถึงง่ายและให้กำลังใจ (Tone: Wise, Mystical, Encouraging, Respectful)
        
        คำถามของผู้ใช้: "${question}"
        รูปแบบการวางไพ่: ${spread}
        
        ไพ่ที่เปิดได้:
        ${cards.map((c: any) => `
        - ${c.name_th} (${c.name_en})
          ตำแหน่ง: ${c.position}
          สถานะ: ${c.isReversed ? 'กลับหัว (Reversed)' : 'ตั้งตรง (Upright)'}
          คีย์เวิร์ด: ${c.keywords?.join(', ')}
          ความหมายพื้นฐาน: ${c.isReversed ? c.meaning_reversed : c.meaning_upright}
        `).join('\n')}

        กติกาการทำนาย:
        1. เริ่มต้นด้วยการทักทายที่สุภาพแบบไทย (เช่น "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่คำทำนายจากอาจารย์...") และคำเกริ่นถึงพลังงานรอบตัวผู้ใช้ในขณะนี้
        2. อธิบายความหมายของไพ่แต่ละใบในตำแหน่งที่เปิดได้ โดยเชื่อมโยงกับ "ดวงชะตา" และคำถามของผู้ใช้อย่างลึกซึ้ง
        3. ใช้ "ความหมายพื้นฐาน" ที่ให้มาเป็นแนวทางหลักในการตีความ แต่ขยายความให้เข้ากับบริบทไทย
        4. ให้คำทำนายที่เจาะลึกถึงคำถามที่ผู้ใช้ถาม โดยใช้หลักความเชื่อแบบไทย (เช่น เรื่องโชคลาภ, บารมี, กัลยาณมิตร, สิ่งศักดิ์สิทธิ์)
        5. ให้ "คำชี้แนะ" ที่ชัดเจน นำไปปฏิบัติได้จริง เพื่อแก้ไขอุปสรรคหรือเสริมดวง (เช่น การทำบุญ, การปรับทัศนคติ)
        6. จบด้วยพรที่เป็นมงคลและพลังบวกที่ประทับใจ

        โครงสร้างเอาต์พุต (Markdown):
        # 🔮 คำทำนายจากสรวงสวรรค์
        ## ✨ ไพ่ที่ปรากฏในดวงชะตาคุณ
        [รายการไพ่พร้อมไอคอนที่เหมาะสม]

        ## 📜 ถอดรหัสคำทำนาย
        [วิเคราะห์เชิงลึกแยกตามตำแหน่ง]

        ## 💡 คำแนะนำเพื่อเสริมสิริมงคล
        [ข้อแนะนำการใช้ชีวิต หรือแนวทางแก้ไข]

        ---
        ขอให้บารมีและสิ่งศักดิ์สิทธิ์คุ้มครองคุณ...
      `;

      const result = await model.generateContent(prompt);
      const interpretation = result.response.text();
      
      res.json({ interpretation });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate interpretation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
