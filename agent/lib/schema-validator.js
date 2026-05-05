import Ajv from 'ajv'

const ajv = new Ajv({
  allErrors: true,
  strict: false,
})

const validatorCache = new WeakMap()

export function createSchemaValidator(schema) {
  if (!schema || typeof schema !== 'object') {
    return () => false
  }

  if (validatorCache.has(schema)) {
    return validatorCache.get(schema)
  }

  const validator = ajv.compile(schema)

  validatorCache.set(schema, validator)

  return validator
}
