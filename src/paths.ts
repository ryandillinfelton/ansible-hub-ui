export function formatPath(path: Paths, data: any) {
    let url = path as string;

    for (const k of Object.keys(data)) {
        url = url.replace(':' + k, data[k]);
    }

    return url;
}

export enum Paths {
    myCollections = '/my-namespaces/:namespace',
    myNamespaces = '/my-namespaces/',
    editNamespace = '/my-namespaces/edit/:namespace',
    myImportsNamespace = '/my-imports/:namespace',
    myImports = '/my-imports',
    search = '/',
    collectionDocsPage = '/:namespace/:collection/docs/:page',
    collectionDocsIndex = '/:namespace/:collection/docs',
    collectionContentDocs = '/:namespace/:collection/content/:type/:name',
    collectionContentList = '/:namespace/:collection/content',
    collection = '/:namespace/:collection',
    namespace = '/:namespace',
    partners = '/partners',
    notFound = '/not-found',
}
