import { scanFiles } from './fileScanner';

// Helper to create mock entries
const createMockFileEntry = (name, path) => ({
    isFile: true,
    isDirectory: false,
    name,
    fullPath: path,
    file: (cb) => cb({ name, path }) // Mock file object
});

const createMockDirectoryEntry = (name, path, children = []) => ({
    isFile: false,
    isDirectory: true,
    name,
    fullPath: path,
    createReader: () => ({
        readEntries: (cb) => cb(children)
    })
});

describe('scanFiles', () => {
    test('scans a single file entry', async () => {
        const entry = createMockFileEntry('test.txt', '/test.txt');
        const result = await scanFiles(entry);
        
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('test.txt');
        expect(result[0].path).toBe('test.txt'); // substring(1)
    });

    test('scans a directory with files', async () => {
        const file1 = createMockFileEntry('a.txt', '/dir/a.txt');
        const file2 = createMockFileEntry('b.txt', '/dir/b.txt');
        const dir = createMockDirectoryEntry('dir', '/dir', [file1, file2]);

        const result = await scanFiles(dir);
        expect(result).toHaveLength(2);
        expect(result.map(f => f.name)).toEqual(expect.arrayContaining(['a.txt', 'b.txt']));
    });

    test('scans nested directories', async () => {
        const file = createMockFileEntry('deep.txt', '/root/nested/deep.txt');
        const nestedDir = createMockDirectoryEntry('nested', '/root/nested', [file]);
        const rootDir = createMockDirectoryEntry('root', '/root', [nestedDir]);

        const result = await scanFiles(rootDir);
        expect(result).toHaveLength(1);
        expect(result[0].path).toBe('root/nested/deep.txt');
    });

    test('handles empty directory', async () => {
        const dir = createMockDirectoryEntry('empty', '/empty', []);
        const result = await scanFiles(dir);
        expect(result).toHaveLength(0);
    });
});
