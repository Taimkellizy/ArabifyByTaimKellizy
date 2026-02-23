/**
 * recursively scans a FileSystemEntry (file or directory) and returns a flat list of File objects.
 * Compatible with DataTransferItem.webkitGetAsEntry()
 * 
 * @param {FileSystemEntry} entry 
 * @returns {Promise<File[]>}
 */
export const scanFiles = async (entry) => {
    if (entry.isFile) {
        return new Promise((resolve) => {
           entry.file((file) => {
               // Patch path to include full path from root of drag
               file.path = entry.fullPath.substring(1); // remove leading slash
               resolve([file]);
           }); 
        });
    } else if (entry.isDirectory) {
        const directoryReader = entry.createReader();
        const entries = await new Promise((resolve) => {
            directoryReader.readEntries((entries) => resolve(entries));
        });
        
        const filesPromises = entries.map(e => scanFiles(e));
        const filesArrays = await Promise.all(filesPromises);
        return filesArrays.flat();
    }
    return [];
};
