import analyzeCSS from './analyzeCSS';

// Mock text object
const mockText = {
    errtypeRTL: 'RTL Error',
    fixMarginLeft: 'Fix margin-left',
    fixMarginRight: 'Fix margin-right',
    fixPaddingLeft: 'Fix padding-left',
    fixPaddingRight: 'Fix padding-right',
    fixBorderLeft: 'Fix border-left',
    fixBorderRight: 'Fix border-right',
    fixTextAlign: 'Fix text-align',
    fixBorderTopLeftRadius: 'Fix border-top-left-radius',
    fixBorderTopRightRadius: 'Fix border-top-right-radius',
    fixBorderBottomLeftRadius: 'Fix border-bottom-left-radius',
    fixBorderBottomRightRadius: 'Fix border-bottom-right-radius',
    fixBorderRadiusShorthand: 'Fix border-radius shorthand',
    fixLeftPosition: 'Fix left position',
    fixRightPosition: 'Fix right position',
    errtypeResponsiveness: 'Responsiveness Error',
    warnPx: 'Avoid large pixels'
};

describe('analyzeCSS', () => {
    test('returns 100 score for safe CSS', async () => {
        const css = '.foo { color: red; }';
        const result = await analyzeCSS(css, mockText);
        expect(result.score).toBe(100);
        expect(result.warnings).toHaveLength(0);
        expect(result.fixedCSS).toContain('color: red');
    });

    test('converts margin-left to margin-inline-start', async () => {
        const css = '.foo { margin-left: 10px; }';
        const result = await analyzeCSS(css, mockText);
        expect(result.score).toBeLessThan(100);
        expect(result.warnings).toEqual(
            expect.arrayContaining([expect.objectContaining({ msg: 'Fix margin-left' })])
        );
        expect(result.fixedCSS).toContain('margin-inline-start: 10px');
    });

    test('converts text-align: left to start', async () => {
        const css = '.foo { text-align: left; }';
        const result = await analyzeCSS(css, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([expect.objectContaining({ msg: 'Fix text-align' })])
        );
        expect(result.fixedCSS).toContain('text-align: start');
    });

    test('explodes border-radius shorthand', async () => {
        const css = '.foo { border-radius: 1px 2px 3px 4px; }';
        const result = await analyzeCSS(css, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([expect.objectContaining({ msg: 'Fix border-radius shorthand' })])
        );
        expect(result.fixedCSS).toContain('border-start-start-radius: 1px');
        expect(result.fixedCSS).toContain('border-start-end-radius: 2px');
        expect(result.fixedCSS).toContain('border-end-end-radius: 3px');
        expect(result.fixedCSS).toContain('border-end-start-radius: 4px');
    });

    test('warns about large pixel values', async () => {
        const css = '.foo { width: 20px; }';
        const result = await analyzeCSS(css, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([expect.objectContaining({ msg: 'Avoid large pixels' })])
        );
        // Pixel warnings don't enforce a fix implementation in the current logic, just a warning
        expect(result.fixedCSS).toContain('width: 20px');
    });
});
