/**
 * OBELISK DEX - Comprehensive Accessibility Test Suite
 * Tests WCAG 2.1 AA compliance with practical user scenarios
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AccessibilityTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            pages: {},
            summary: { passed: 0, failed: 0, warnings: 0 }
        };
        this.browser = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async close() {
        if (this.browser) await this.browser.close();
    }

    async testPage(filePath) {
        const pageName = path.basename(filePath);
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${pageName}`);
        console.log('='.repeat(60));

        const page = await this.browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
        await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const pageResults = {
            file: pageName,
            tests: [],
            passed: 0,
            failed: 0,
            warnings: 0
        };

        // Run all tests
        await this.testKeyboardNavigation(page, pageResults);
        await this.testARIALandmarks(page, pageResults);
        await this.testSkipLinks(page, pageResults);
        await this.testFocusStyles(page, pageResults);
        await this.testImages(page, pageResults);
        await this.testLinks(page, pageResults);
        await this.testButtons(page, pageResults);
        await this.testForms(page, pageResults);
        await this.testHeadings(page, pageResults);
        await this.testColorContrast(page, pageResults);
        await this.testReducedMotion(page, pageResults);
        await this.testMobileResponsive(page, pageResults);
        await this.testInteractiveElements(page, pageResults);

        await page.close();

        this.results.pages[pageName] = pageResults;
        this.results.summary.passed += pageResults.passed;
        this.results.summary.failed += pageResults.failed;
        this.results.summary.warnings += pageResults.warnings;

        return pageResults;
    }

    addResult(pageResults, name, status, details) {
        const test = { name, status, details, timestamp: new Date().toISOString() };
        pageResults.tests.push(test);

        const icon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '⚠';
        const color = status === 'passed' ? '\x1b[32m' : status === 'failed' ? '\x1b[31m' : '\x1b[33m';
        console.log(`  ${color}${icon}\x1b[0m ${name}: ${details}`);

        pageResults[status === 'warning' ? 'warnings' : status]++;
    }

    async testKeyboardNavigation(page, pageResults) {
        console.log('\n  [Keyboard Navigation Tests]');

        // Test Tab navigation
        const focusableElements = await page.evaluate(() => {
            const selectors = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
            return document.querySelectorAll(selectors).length;
        });

        if (focusableElements > 0) {
            this.addResult(pageResults, 'Focusable Elements', 'passed',
                `Found ${focusableElements} focusable elements`);
        } else {
            this.addResult(pageResults, 'Focusable Elements', 'warning',
                'No focusable elements found');
        }

        // Test that Tab key moves focus
        const tabWorks = await page.evaluate(() => {
            const first = document.querySelector('a[href], button, input, [tabindex]:not([tabindex="-1"])');
            if (!first) return null;
            first.focus();
            return document.activeElement === first;
        });

        if (tabWorks === true) {
            this.addResult(pageResults, 'Focus Management', 'passed',
                'Elements can receive focus');
        } else if (tabWorks === null) {
            this.addResult(pageResults, 'Focus Management', 'warning',
                'No focusable elements to test');
        } else {
            this.addResult(pageResults, 'Focus Management', 'failed',
                'Focus management not working');
        }

        // Check tabindex values
        const badTabindex = await page.evaluate(() => {
            const els = document.querySelectorAll('[tabindex]');
            let bad = [];
            els.forEach(el => {
                const val = parseInt(el.getAttribute('tabindex'));
                if (val > 0) bad.push(`${el.tagName}[tabindex="${val}"]`);
            });
            return bad;
        });

        if (badTabindex.length === 0) {
            this.addResult(pageResults, 'Tabindex Values', 'passed',
                'No positive tabindex values (good!)');
        } else {
            this.addResult(pageResults, 'Tabindex Values', 'warning',
                `Found ${badTabindex.length} positive tabindex: ${badTabindex.slice(0,3).join(', ')}`);
        }
    }

    async testARIALandmarks(page, pageResults) {
        console.log('\n  [ARIA Landmarks Tests]');

        const landmarks = await page.evaluate(() => {
            return {
                main: document.querySelectorAll('main, [role="main"]').length,
                nav: document.querySelectorAll('nav, [role="navigation"]').length,
                header: document.querySelectorAll('header, [role="banner"]').length,
                footer: document.querySelectorAll('footer, [role="contentinfo"]').length,
                region: document.querySelectorAll('[role="region"][aria-label], section[aria-label]').length
            };
        });

        if (landmarks.main >= 1) {
            this.addResult(pageResults, 'Main Landmark', 'passed',
                `Found ${landmarks.main} main landmark(s)`);
        } else {
            this.addResult(pageResults, 'Main Landmark', 'failed',
                'Missing main landmark - required for screen readers');
        }

        if (landmarks.nav >= 1) {
            this.addResult(pageResults, 'Navigation Landmark', 'passed',
                `Found ${landmarks.nav} navigation landmark(s)`);
        } else {
            this.addResult(pageResults, 'Navigation Landmark', 'warning',
                'No navigation landmark found');
        }

        if (landmarks.header >= 1) {
            this.addResult(pageResults, 'Banner Landmark', 'passed',
                `Found ${landmarks.header} banner/header`);
        } else {
            this.addResult(pageResults, 'Banner Landmark', 'warning',
                'No banner/header landmark');
        }
    }

    async testSkipLinks(page, pageResults) {
        console.log('\n  [Skip Link Tests]');

        const skipLink = await page.evaluate(() => {
            const link = document.querySelector('a[href^="#"]:first-of-type, .skip-link');
            if (!link) return null;
            const text = link.textContent.toLowerCase();
            const isSkip = text.includes('skip') || text.includes('aller') || text.includes('passer');
            return { found: true, isSkip, text: link.textContent.trim() };
        });

        if (skipLink && skipLink.isSkip) {
            this.addResult(pageResults, 'Skip Link', 'passed',
                `Found skip link: "${skipLink.text}"`);
        } else if (skipLink) {
            this.addResult(pageResults, 'Skip Link', 'warning',
                `First link may not be skip link: "${skipLink.text}"`);
        } else {
            this.addResult(pageResults, 'Skip Link', 'failed',
                'No skip link found - keyboard users need this');
        }
    }

    async testFocusStyles(page, pageResults) {
        console.log('\n  [Focus Styles Tests]');

        const hasFocusStyles = await page.evaluate(() => {
            const sheets = document.styleSheets;
            for (let i = 0; i < sheets.length; i++) {
                try {
                    const rules = sheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        const text = rules[j].cssText;
                        if (text.includes(':focus') || text.includes(':focus-visible')) {
                            return true;
                        }
                    }
                } catch (e) {}
            }
            return false;
        });

        if (hasFocusStyles) {
            this.addResult(pageResults, 'Focus Styles CSS', 'passed',
                'Focus styles defined in CSS');
        } else {
            this.addResult(pageResults, 'Focus Styles CSS', 'failed',
                'No focus styles found - keyboard users cannot see focus');
        }

        // Test actual focus visibility
        const focusVisible = await page.evaluate(() => {
            const btn = document.querySelector('button, a[href]');
            if (!btn) return null;
            btn.focus();
            const styles = window.getComputedStyle(btn);
            const outline = styles.outline;
            const boxShadow = styles.boxShadow;
            return outline !== 'none' || boxShadow !== 'none';
        });

        if (focusVisible === true) {
            this.addResult(pageResults, 'Focus Visibility', 'passed',
                'Focus is visible on interactive elements');
        } else if (focusVisible === null) {
            this.addResult(pageResults, 'Focus Visibility', 'warning',
                'No elements to test focus on');
        }
    }

    async testImages(page, pageResults) {
        console.log('\n  [Image Accessibility Tests]');

        const images = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            let withAlt = 0, withoutAlt = 0, decorative = 0;
            imgs.forEach(img => {
                if (img.hasAttribute('alt')) {
                    if (img.getAttribute('alt') === '') decorative++;
                    else withAlt++;
                } else withoutAlt++;
            });
            return { total: imgs.length, withAlt, withoutAlt, decorative };
        });

        if (images.total === 0) {
            this.addResult(pageResults, 'Images', 'passed', 'No images to check');
        } else if (images.withoutAlt === 0) {
            this.addResult(pageResults, 'Images Alt Text', 'passed',
                `All ${images.total} images have alt attributes (${images.decorative} decorative)`);
        } else {
            this.addResult(pageResults, 'Images Alt Text', 'failed',
                `${images.withoutAlt}/${images.total} images missing alt text`);
        }

        // Check aria-hidden on decorative images
        const ariaHiddenImages = await page.evaluate(() => {
            const decorative = document.querySelectorAll('img[alt=""], [aria-hidden="true"] img, img[aria-hidden="true"]');
            return decorative.length;
        });

        if (ariaHiddenImages > 0 || images.decorative > 0) {
            this.addResult(pageResults, 'Decorative Images', 'passed',
                `${ariaHiddenImages + images.decorative} decorative images properly marked`);
        }
    }

    async testLinks(page, pageResults) {
        console.log('\n  [Link Accessibility Tests]');

        const links = await page.evaluate(() => {
            const allLinks = document.querySelectorAll('a[href]');
            let issues = [];
            let external = 0, hasNoopener = 0;

            allLinks.forEach(link => {
                const text = link.textContent.trim().toLowerCase();
                const ariaLabel = link.getAttribute('aria-label');

                // Check for generic link text
                if (['click here', 'here', 'read more', 'learn more', 'link'].includes(text) && !ariaLabel) {
                    issues.push(`Generic text: "${text}"`);
                }

                // Check external links
                if (link.target === '_blank') {
                    external++;
                    if (link.rel && link.rel.includes('noopener')) hasNoopener++;
                }
            });

            return { total: allLinks.length, issues, external, hasNoopener };
        });

        if (links.issues.length === 0) {
            this.addResult(pageResults, 'Link Text Quality', 'passed',
                `All ${links.total} links have descriptive text`);
        } else {
            this.addResult(pageResults, 'Link Text Quality', 'warning',
                `${links.issues.length} links with generic text`);
        }

        if (links.external === 0) {
            this.addResult(pageResults, 'External Links Security', 'passed',
                'No external links to check');
        } else if (links.hasNoopener === links.external) {
            this.addResult(pageResults, 'External Links Security', 'passed',
                `All ${links.external} external links have rel="noopener"`);
        } else {
            this.addResult(pageResults, 'External Links Security', 'warning',
                `${links.external - links.hasNoopener}/${links.external} external links missing noopener`);
        }
    }

    async testButtons(page, pageResults) {
        console.log('\n  [Button Accessibility Tests]');

        const buttons = await page.evaluate(() => {
            const allButtons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
            let issues = [];

            allButtons.forEach((btn, i) => {
                const text = btn.textContent.trim();
                const ariaLabel = btn.getAttribute('aria-label');
                const title = btn.getAttribute('title');

                if (!text && !ariaLabel && !title) {
                    issues.push(`Button ${i + 1} has no accessible name`);
                }

                // Check if div/span acting as button (a[href] is already focusable)
                if (btn.getAttribute('role') === 'button' && !btn.hasAttribute('tabindex') &&
                    !(btn.tagName === 'A' && btn.hasAttribute('href'))) {
                    issues.push(`${btn.tagName} with role="button" missing tabindex`);
                }
            });

            // Check for click handlers on non-interactive elements
            const divButtons = document.querySelectorAll('div[onclick], span[onclick]');
            divButtons.forEach(el => {
                if (!el.getAttribute('role') && !el.hasAttribute('tabindex')) {
                    issues.push(`${el.tagName} with onclick but no role/tabindex`);
                }
            });

            return { total: allButtons.length, issues };
        });

        if (buttons.issues.length === 0) {
            this.addResult(pageResults, 'Button Accessibility', 'passed',
                `All ${buttons.total} buttons are accessible`);
        } else {
            this.addResult(pageResults, 'Button Accessibility', 'failed',
                `${buttons.issues.length} button issues: ${buttons.issues[0]}`);
        }
    }

    async testForms(page, pageResults) {
        console.log('\n  [Form Accessibility Tests]');

        const forms = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea');
            let withLabel = 0, withoutLabel = 0;

            inputs.forEach(input => {
                const id = input.id;
                const ariaLabel = input.getAttribute('aria-label');
                const ariaLabelledby = input.getAttribute('aria-labelledby');
                const placeholder = input.getAttribute('placeholder');
                const label = id ? document.querySelector(`label[for="${id}"]`) : null;

                if (label || ariaLabel || ariaLabelledby) {
                    withLabel++;
                } else if (placeholder) {
                    withoutLabel++; // Placeholder alone is not sufficient
                } else {
                    withoutLabel++;
                }
            });

            return { total: inputs.length, withLabel, withoutLabel };
        });

        if (forms.total === 0) {
            this.addResult(pageResults, 'Form Labels', 'passed', 'No form inputs to check');
        } else if (forms.withoutLabel === 0) {
            this.addResult(pageResults, 'Form Labels', 'passed',
                `All ${forms.total} form inputs have labels`);
        } else {
            this.addResult(pageResults, 'Form Labels', 'failed',
                `${forms.withoutLabel}/${forms.total} inputs missing proper labels`);
        }
    }

    async testHeadings(page, pageResults) {
        console.log('\n  [Heading Structure Tests]');

        const headings = await page.evaluate(() => {
            const all = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const structure = [];
            let h1Count = 0;
            let skipped = false;
            let lastLevel = 0;

            all.forEach(h => {
                const level = parseInt(h.tagName[1]);
                structure.push({ level, text: h.textContent.trim().substring(0, 30) });
                if (level === 1) h1Count++;
                if (level > lastLevel + 1 && lastLevel !== 0) skipped = true;
                lastLevel = level;
            });

            return { total: all.length, h1Count, skipped, structure };
        });

        if (headings.h1Count === 1) {
            this.addResult(pageResults, 'Single H1', 'passed',
                'Page has exactly one H1');
        } else if (headings.h1Count === 0) {
            this.addResult(pageResults, 'Single H1', 'failed',
                'Page has no H1 heading');
        } else {
            this.addResult(pageResults, 'Single H1', 'warning',
                `Page has ${headings.h1Count} H1 headings`);
        }

        if (!headings.skipped) {
            this.addResult(pageResults, 'Heading Hierarchy', 'passed',
                'Heading levels are sequential');
        } else {
            this.addResult(pageResults, 'Heading Hierarchy', 'warning',
                'Heading levels skip (e.g., H1 to H3)');
        }
    }

    async testColorContrast(page, pageResults) {
        console.log('\n  [Color Contrast Tests]');

        const contrastIssues = await page.evaluate(() => {
            function getLuminance(r, g, b) {
                const [rs, gs, bs] = [r, g, b].map(c => {
                    c = c / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
            }

            function getContrastRatio(l1, l2) {
                const lighter = Math.max(l1, l2);
                const darker = Math.min(l1, l2);
                return (lighter + 0.05) / (darker + 0.05);
            }

            function parseColor(color) {
                if (color.startsWith('rgb')) {
                    const match = color.match(/\d+/g);
                    if (match) return match.map(Number);
                }
                return null;
            }

            const textElements = document.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6');
            let issues = 0;
            let checked = 0;

            textElements.forEach(el => {
                const styles = window.getComputedStyle(el);
                const color = parseColor(styles.color);
                const bgColor = parseColor(styles.backgroundColor);

                if (color && bgColor && bgColor[3] !== 0) {
                    const textLum = getLuminance(...color);
                    const bgLum = getLuminance(...bgColor);
                    const ratio = getContrastRatio(textLum, bgLum);

                    const fontSize = parseFloat(styles.fontSize);
                    const isBold = parseInt(styles.fontWeight) >= 700;
                    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);

                    const minRatio = isLargeText ? 3 : 4.5;
                    if (ratio < minRatio) issues++;
                    checked++;
                }
            });

            return { checked, issues };
        });

        if (contrastIssues.issues === 0) {
            this.addResult(pageResults, 'Color Contrast', 'passed',
                `Checked ${contrastIssues.checked} elements, all pass WCAG AA`);
        } else {
            this.addResult(pageResults, 'Color Contrast', 'warning',
                `${contrastIssues.issues} potential contrast issues (check manually)`);
        }

        // Check for color-only information
        const colorOnly = await page.evaluate(() => {
            const errors = document.querySelectorAll('.error, .success, .warning, [class*="error"], [class*="success"]');
            let hasIcon = 0;
            errors.forEach(el => {
                if (el.querySelector('svg, img, [aria-hidden]') || el.textContent.includes('✓') || el.textContent.includes('✗')) {
                    hasIcon++;
                }
            });
            return { total: errors.length, hasIcon };
        });

        if (colorOnly.total === 0 || colorOnly.hasIcon === colorOnly.total) {
            this.addResult(pageResults, 'Color-only Information', 'passed',
                'Status indicators use more than just color');
        } else {
            this.addResult(pageResults, 'Color-only Information', 'warning',
                `${colorOnly.total - colorOnly.hasIcon} status elements may rely on color alone`);
        }
    }

    async testReducedMotion(page, pageResults) {
        console.log('\n  [Motion & Animation Tests]');

        const hasReducedMotion = await page.evaluate(() => {
            const sheets = document.styleSheets;
            for (let i = 0; i < sheets.length; i++) {
                try {
                    const rules = sheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].cssText.includes('prefers-reduced-motion')) {
                            return true;
                        }
                    }
                } catch (e) {}
            }
            return false;
        });

        if (hasReducedMotion) {
            this.addResult(pageResults, 'Reduced Motion Support', 'passed',
                'Supports prefers-reduced-motion');
        } else {
            this.addResult(pageResults, 'Reduced Motion Support', 'warning',
                'No prefers-reduced-motion media query found');
        }

        // Check for auto-playing content
        const autoPlay = await page.evaluate(() => {
            const videos = document.querySelectorAll('video[autoplay], audio[autoplay]');
            const carousels = document.querySelectorAll('[class*="carousel"], [class*="slider"], [class*="rotate"]');
            return { videos: videos.length, carousels: carousels.length };
        });

        if (autoPlay.videos === 0 && autoPlay.carousels === 0) {
            this.addResult(pageResults, 'Auto-playing Content', 'passed',
                'No auto-playing videos or carousels');
        } else {
            this.addResult(pageResults, 'Auto-playing Content', 'warning',
                `Found ${autoPlay.videos} autoplay videos, ${autoPlay.carousels} carousels`);
        }
    }

    async testMobileResponsive(page, pageResults) {
        console.log('\n  [Mobile Responsiveness Tests]');

        // Test at mobile viewport
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(r => setTimeout(r, 500));

        const mobileCheck = await page.evaluate(() => {
            const viewport = document.querySelector('meta[name="viewport"]');
            const hasViewport = viewport && viewport.content.includes('width=device-width');

            // Check for horizontal overflow
            const bodyWidth = document.body.scrollWidth;
            const windowWidth = window.innerWidth;
            const hasOverflow = bodyWidth > windowWidth + 10;

            // Check touch target sizes
            const buttons = document.querySelectorAll('button, a, input, select');
            let smallTargets = 0;
            buttons.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    if (rect.width < 44 || rect.height < 44) smallTargets++;
                }
            });

            return { hasViewport, hasOverflow, smallTargets, totalTargets: buttons.length };
        });

        if (mobileCheck.hasViewport) {
            this.addResult(pageResults, 'Viewport Meta', 'passed',
                'Has responsive viewport meta tag');
        } else {
            this.addResult(pageResults, 'Viewport Meta', 'failed',
                'Missing viewport meta tag');
        }

        if (!mobileCheck.hasOverflow) {
            this.addResult(pageResults, 'Horizontal Scroll', 'passed',
                'No horizontal overflow on mobile');
        } else {
            this.addResult(pageResults, 'Horizontal Scroll', 'failed',
                'Page has horizontal scroll on mobile');
        }

        if (mobileCheck.smallTargets === 0) {
            this.addResult(pageResults, 'Touch Target Size', 'passed',
                'All touch targets are 44x44px or larger');
        } else {
            this.addResult(pageResults, 'Touch Target Size', 'warning',
                `${mobileCheck.smallTargets}/${mobileCheck.totalTargets} targets below 44px`);
        }

        // Reset viewport
        await page.setViewport({ width: 1280, height: 800 });
    }

    async testInteractiveElements(page, pageResults) {
        console.log('\n  [Interactive Elements Tests]');

        const interactive = await page.evaluate(() => {
            // Check for keyboard traps
            const modals = document.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
            const hasModals = modals.length > 0;

            // Check for aria-expanded on toggles
            const toggles = document.querySelectorAll('[aria-expanded], [aria-haspopup]');

            // Check for aria-live regions
            const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"]');

            // Check for proper list semantics
            const lists = document.querySelectorAll('ul, ol');
            const navWithLists = document.querySelectorAll('nav ul, nav ol');

            return {
                modals: hasModals,
                toggles: toggles.length,
                liveRegions: liveRegions.length,
                lists: lists.length,
                navLists: navWithLists.length
            };
        });

        if (interactive.liveRegions > 0) {
            this.addResult(pageResults, 'Live Regions', 'passed',
                `${interactive.liveRegions} aria-live region(s) for dynamic updates`);
        } else {
            this.addResult(pageResults, 'Live Regions', 'warning',
                'No aria-live regions for dynamic content');
        }

        if (interactive.toggles > 0) {
            this.addResult(pageResults, 'Toggle States', 'passed',
                `${interactive.toggles} elements with aria-expanded/haspopup`);
        }

        if (interactive.navLists > 0) {
            this.addResult(pageResults, 'Navigation Lists', 'passed',
                'Navigation uses proper list semantics');
        } else if (interactive.lists === 0) {
            this.addResult(pageResults, 'Navigation Lists', 'warning',
                'Consider using ul/li for navigation items');
        }
    }

    generateReport() {
        const { passed, failed, warnings } = this.results.summary;
        const total = passed + failed + warnings;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

        console.log('\n' + '='.repeat(60));
        console.log('ACCESSIBILITY TEST REPORT');
        console.log('='.repeat(60));
        console.log(`\nTimestamp: ${this.results.timestamp}`);
        console.log(`\nSummary:`);
        console.log(`  Total Tests: ${total}`);
        console.log(`  \x1b[32mPassed: ${passed}\x1b[0m`);
        console.log(`  \x1b[31mFailed: ${failed}\x1b[0m`);
        console.log(`  \x1b[33mWarnings: ${warnings}\x1b[0m`);
        console.log(`  Pass Rate: ${passRate}%`);

        // Determine verdict
        let verdict, stars;
        if (failed === 0 && warnings <= 3) {
            verdict = 'EXCELLENT - WCAG 2.1 AA Compliant';
            stars = '★★★★★';
        } else if (failed <= 2 && warnings <= 5) {
            verdict = 'GOOD - Minor improvements needed';
            stars = '★★★★☆';
        } else if (failed <= 5) {
            verdict = 'FAIR - Several issues to address';
            stars = '★★★☆☆';
        } else {
            verdict = 'NEEDS WORK - Critical issues found';
            stars = '★★☆☆☆';
        }

        console.log(`\n${stars}`);
        console.log(`Verdict: ${verdict}`);

        // List failed tests
        if (failed > 0) {
            console.log('\n\x1b[31mFailed Tests:\x1b[0m');
            Object.values(this.results.pages).forEach(page => {
                page.tests.filter(t => t.status === 'failed').forEach(t => {
                    console.log(`  - [${page.file}] ${t.name}: ${t.details}`);
                });
            });
        }

        // Save JSON report
        fs.writeFileSync('accessibility-report.json', JSON.stringify(this.results, null, 2));
        console.log('\nDetailed report saved to: accessibility-report.json');

        return { passed, failed, warnings, passRate, verdict };
    }
}

async function main() {
    console.log('\n🔍 OBELISK DEX - Accessibility Test Suite');
    console.log('Testing WCAG 2.1 AA Compliance\n');

    const tester = new AccessibilityTester();
    await tester.init();

    const htmlFiles = [
        'C:/Users/Hugop/obelisk-dex/index.html',
        'C:/Users/Hugop/obelisk-dex/app.html',
        'C:/Users/Hugop/obelisk-dex/docs.html'
    ];

    for (const file of htmlFiles) {
        if (fs.existsSync(file)) {
            await tester.testPage(file);
        } else {
            console.log(`Skipping ${file} - not found`);
        }
    }

    await tester.close();

    const result = tester.generateReport();

    // Exit with appropriate code
    process.exit(result.failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
