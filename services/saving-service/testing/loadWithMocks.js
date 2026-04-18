const Module = require("node:module");
const path = require("node:path");

function loadWithMocks(modulePath, mocks) {
    const resolvedModulePath = require.resolve(modulePath);
    const baseDir = path.dirname(resolvedModulePath);
    const resolvedMocks = new Map(
        Object.entries(mocks).map(([request, mockValue]) => [
            require.resolve(request, { paths: [baseDir] }),
            mockValue,
        ])
    );

    delete require.cache[resolvedModulePath];

    const originalLoad = Module._load;
    Module._load = function patchedLoad(request, parent, isMain) {
        const resolvedRequest = Module._resolveFilename(request, parent, isMain);
        if (resolvedMocks.has(resolvedRequest)) {
            return resolvedMocks.get(resolvedRequest);
        }

        return originalLoad.apply(this, arguments);
    };

    try {
        return require(resolvedModulePath);
    } finally {
        Module._load = originalLoad;
    }
}

module.exports = loadWithMocks;
