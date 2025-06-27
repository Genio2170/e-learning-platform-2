// services/chatbotService.js
const { NlpManager } = require('node-nlp');
const FAQ = require('../models/Faq');

class Chatbot {
  constructor() {
    this.manager = new NlpManager({ languages: ['pt'], forceNER: true });
    this.isTrained = false;
  }

  async train() {
    const faqs = await FAQ.find();
    
    faqs.forEach(faq => {
      this.manager.addDocument('pt', faq.question, faq.tag);
      this.manager.addAnswer('pt', faq.tag, faq.answer);
    });

    // Adicionar padrões genéricos
    this.manager.addDocument('pt', 'Olá', 'saudacao');
    this.manager.addAnswer('pt', 'saudacao', 'Olá! Como posso ajudar?');
    
    await this.manager.train();
    this.manager.save();
    this.isTrained = true;
  }

  async processMessage(text) {
    if (!this.isTrained) await this.train();
    
    const response = await this.manager.process('pt', text);
    
    if (response.intent === 'None') {
      return {
        text: 'Desculpe, não entendi. Poderia reformular a pergunta?',
        options: [
          { text: 'Preciso de ajuda com pagamentos', value: 'pagamento' },
          { text: 'Problemas técnicos', value: 'suporte tecnico' }
        ]
      };
    }
    
    return {
      text: response.answer,
      options: []
    };
  }
}

module.exports = new Chatbot();