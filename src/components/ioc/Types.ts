const TYPES = {
    ILogger: Symbol.for("ILogger"),
    IRepository: Symbol.for("IRepository"),
    IRequest:Symbol.for("IRequest"),
    IDefaultHeaderPlugin:Symbol.for("IDefaultHeaderPlugin"),
    ICache:Symbol.for("ICache"),
    ILoginNet:Symbol.for("ILoginNet"),
    ILoginApplication:Symbol.for("ILoginApplication"),
};

export { TYPES };