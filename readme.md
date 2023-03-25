## adot-span

to get otel aws instrumentation to work, specifically the patching function:

* compile to commonjs, with no `createRequire` banner
* use `module.exports = { handler }` in source, to avoid a "Cannot redefine property" error (see https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67)
