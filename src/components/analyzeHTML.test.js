import analyzeHTML from './analyzeHTML';

// Mock text object
const mockText = {
    errtypeStructure: 'Structure Error',
    msgMissingHeader: 'Missing Header',
    msgMissingNav: 'Missing Nav',
    msgMissingFooter: 'Missing Footer',
    errtypeMeta: 'Meta Error',
    msgMissingMetaCharset: 'Missing Charset',
    msgMissingMetaViewport: 'Missing Viewport',
    msgMissingMetaDescription: 'Missing Description',
    msgMissingMetaKeywords: 'Missing Keywords',
    msgMissingMetaAuthor: 'Missing Author',
    errtypeLanguage: 'Language Error',
    msgMissingLangAttribute: 'Missing Lang',
    msgMissingDirAttribute: 'Missing Dir',
    errtypeAlt: 'Alt Error',
    msgMissingAlt: (i) => `Missing Alt ${i}`
};

describe('analyzeHTML', () => {
    test('returns 100 score for valid HTML structure', () => {
        const html = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width">
        <meta name="description" content="desc">
        <meta name="keywords" content="keys">
        <meta name="author" content="me">
      </head>
      <body>
        <header>Header</header>
        <nav>Nav</nav>
        <footer>Footer</footer>
      </body>
      </html>
    `;
        const result = analyzeHTML(html, mockText);
        expect(result.score).toBe(100);
        expect(result.warnings).toHaveLength(0);
    });

    test('detects missing semantic tags', () => {
        const html = `<div>Content</div>`;
        const result = analyzeHTML(html, mockText);
        expect(result.score).toBeLessThan(100);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Missing Header' }),
                expect.objectContaining({ msg: 'Missing Nav' }),
                expect.objectContaining({ msg: 'Missing Footer' })
            ])
        );
    });

    test('detects missing meta tags', () => {
        const html = `<html><head></head><body></body></html>`;
        const result = analyzeHTML(html, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Missing Charset' }),
                expect.objectContaining({ msg: 'Missing Viewport' })
            ])
        );
    });

    test('detects missing lang/dir attributes', () => {
        const html = `<html><body></body></html>`;
        const result = analyzeHTML(html, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Missing Lang' }),
                expect.objectContaining({ msg: 'Missing Dir' })
            ])
        );
    });

    test('detects missing alt attributes on images', () => {
        const html = `
      <html lang="en" dir="ltr">
        <body>
          <img src="foo.jpg">
        </body>
      </html>
    `;
        const result = analyzeHTML(html, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: 'Alt Error' })
            ])
        );
    });
    test('skips structure checks if isReact is true', () => {
        const html = '<!DOCTYPE html><html><body><div id="root"></div></body></html>';
        const result = analyzeHTML(html, mockText, { isMainFile: true, isReact: true });
        // Should NOT have structure warnings
        expect(result.warnings).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Missing Header' }),
                expect.objectContaining({ msg: 'Missing Nav' }),
                expect.objectContaining({ msg: 'Missing Footer' })
            ])
        );
    });
});
