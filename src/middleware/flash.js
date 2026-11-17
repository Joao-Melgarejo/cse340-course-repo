// Messages survive redirects and are removed only when a template reads them.
const flash = (req, res, next) => {
    req.flash = function (type, message) {
        const messages = req.session.flash || {};
        if (arguments.length === 2) {
            if (!['success', 'error', 'warning', 'info'].includes(type)) {
                throw new TypeError('Unsupported flash message type');
            }
            messages[type] ??= [];
            messages[type].push(String(message));
            req.session.flash = messages;
            return;
        }
        if (arguments.length === 1) {
            const result = messages[type] || [];
            delete messages[type];
            if (req.session.flash) req.session.flash = messages;
            return result;
        }
        delete req.session.flash;
        return messages;
    };
    res.locals.flash = req.flash;
    next();
};

export default flash;
