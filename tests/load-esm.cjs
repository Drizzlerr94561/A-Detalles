const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

async function loadEsm(entry, options = {}) {
  const projectRoot = options.projectRoot || path.resolve(__dirname, "..");
  const entryPath = path.resolve(projectRoot, entry);
  const mocks = options.mocks || {};
  const modules = new Map();
  const context = vm.createContext({
    URL,
    console: { log() {}, warn() {}, error() {} },
    ...options.globals,
  });

  function resolveImport(specifier, parentPath) {
    if (Object.prototype.hasOwnProperty.call(mocks, specifier)) return specifier;
    let resolved;
    if (specifier.startsWith("@/")) {
      resolved = path.resolve(projectRoot, "src", specifier.slice(2));
    } else if (specifier.startsWith(".")) {
      resolved = path.resolve(path.dirname(parentPath), specifier);
    } else {
      throw new Error(`Import sin mock: ${specifier}`);
    }
    if (!path.extname(resolved)) resolved += ".js";
    return resolved;
  }

  function obtenerModulo(identifier) {
    if (modules.has(identifier)) return modules.get(identifier);
    let esmModule;
    if (Object.prototype.hasOwnProperty.call(mocks, identifier)) {
      const exports = mocks[identifier];
      esmModule = new vm.SyntheticModule(Object.keys(exports), function () {
        for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
      }, { identifier, context });
    } else {
      const sourcePath = options.sourcePaths?.[identifier] || identifier;
      esmModule = new vm.SourceTextModule(fs.readFileSync(sourcePath, "utf8"), {
        identifier,
        context,
      });
    }
    modules.set(identifier, esmModule);
    return esmModule;
  }

  const esmModule = obtenerModulo(entryPath);
  await esmModule.link((specifier, referencingModule) => obtenerModulo(resolveImport(specifier, referencingModule.identifier)));
  await esmModule.evaluate();
  return esmModule.namespace;
}

module.exports = { loadEsm };
