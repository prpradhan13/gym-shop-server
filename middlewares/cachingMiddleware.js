

const caching = (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24hr
    next();
}

export default caching;