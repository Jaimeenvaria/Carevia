const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const aiConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationType: { 
        type: String, 
        enum: ['care_assistant', 'appointment_agent', 'clinical_copilot'],
        default: 'care_assistant' 
    },
    messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
