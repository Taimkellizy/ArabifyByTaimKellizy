import analyzeJSX from './analyzeJSX';

// Mock text object based on content.js structure implied in analyzeJSX.js
const mockText = {
    msgParseError: 'Parse Error',
    errtypeRTL: 'RTL Error',
    msgAvoidPhysicalProp: (p) => `Avoid ${p}`,
    msgAvoidTextAlign: 'Avoid textAlign',
    msgAvoidFloat: 'Avoid float',
    msgAvoidBorderRadiusShorthand: 'Avoid borderRadius shorthand',
    errtypeAlt: 'Alt Error',
    msgMissingAlt: (p) => `Missing alt ${p}`,
    msgEmptyButton: 'Empty Button',
    errtypeStructure: 'Structure Error',
    msgMissingHeader: 'Missing Header',
    msgMissingFooter: 'Missing Footer',
    msgAvoidTextLeftRightClass: 'Avoid text-left/right',
    msgAvoidPhysicalMarginPaddingClass: 'Avoid physical margin/padding'
};

describe('analyzeJSX', () => {
    test('returns 100 score for valid simple JSX', () => {
        const code = `
      import React from 'react';
      const Component = () => <div>Hello</div>;
      export default Component;
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.score).toBe(100);
        expect(result.warnings).toHaveLength(0);
    });

    test('detects physical properties in styles', () => {
        const code = `
      const styles = {
        marginLeft: '10px'
      };
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Avoid marginLeft' })
            ])
        );
        expect(result.score).toBeLessThan(100);
    });

    test('detects textAlign left/right', () => {
        const code = `
      const styles = {
        textAlign: 'left'
      };
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Avoid textAlign' })
            ])
        );
    });

    test('detects float left/right', () => {
        const code = `
      const styles = {
        float: 'right'
      };
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Avoid float' })
            ])
        );
    });

    test('detects borderRadius shorthand with 4 values', () => {
        const code = `
      const styles = {
        borderRadius: '10px 20px 10px 20px'
      };
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Avoid borderRadius shorthand' })
            ])
        );
    });

    test('detects missing alt in img', () => {
        const code = `
      const Component = () => <img src="foo.jpg" />;
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: 'Alt Error' })
            ])
        );
    });

    test('detects empty button without aria-label', () => {
        const code = `
      const Component = () => <button />;
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Empty Button' })
            ])
        );
    });

    test('detects missing Header/Footer in layout (if main/body present)', () => {
        const code = `
      const Layout = () => <main>Content</main>;
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Missing Header' }),
                expect.objectContaining({ msg: 'Missing Footer' })
            ])
        );
    });

    test('detects RTL unfriendly classNames', () => {
        const code = `
      const Component = () => <div className="text-left ml-4" />;
    `;
        const result = analyzeJSX(code, mockText);
        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Avoid text-left/right' }),
                expect.objectContaining({ msg: 'Avoid physical margin/padding' })
            ])
        );
    });
});
