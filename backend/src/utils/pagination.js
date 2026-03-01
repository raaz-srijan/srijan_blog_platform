const getPaginationOptions = (req, defaultLimit = 10) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || defaultLimit);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const getPaginationMetaData = (total, limit, page) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };
};

module.exports = {
    getPaginationOptions,
    getPaginationMetaData
};
