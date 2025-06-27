const { validate } = require('jsonschema');

const messageSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["chat", "notification"] },
    content: { type: "string", maxLength: 1000 }
  },
  required: ["type"]
};

socket.on('message', (data) => {
  const validation = validate(data, messageSchema);
  if (!validation.valid) {
    socket.emit('error', { 
      code: 'INVALID_PAYLOAD',
      details: validation.errors 
    });
    return;
  }

  // Processar mensagem válida
});
