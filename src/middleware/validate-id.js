// SERIAL keys are positive PostgreSQL INTEGERs; reject invalid input before querying.
const validateId = (req, res, next) => {
    const id = req.params.id;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) > 2147483647) {
        const error = new Error('The ID must be a positive integer between 1 and 2147483647.');
        error.status = 400;
        return next(error);
    }
    next();
};

export { validateId };
