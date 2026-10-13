const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({ actorId, actorRole = 'anonymous', action, resourceType, resourceId, metadata = {}, req }) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
        
        // Remove any potentially sensitive fields from metadata
        const safeMetadata = { ...metadata };
        delete safeMetadata.password;
        delete safeMetadata.otp;
        delete safeMetadata.otpHash;
        delete safeMetadata.apiKey;
        delete safeMetadata.token;

        await AuditLog.create({
            actorId: actorId || null,
            actorRole: actorRole || (req && req.user ? req.user.role : 'anonymous'),
            action,
            resourceType,
            resourceId: resourceId ? String(resourceId) : undefined,
            metadata: safeMetadata,
            ipAddress
        });
    } catch (err) {
        console.error("Audit log creation error:", err.message);
    }
};

module.exports = { logAuditEvent };
