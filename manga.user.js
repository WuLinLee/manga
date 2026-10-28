// ==UserScript==
// @name         !!!!!!!!漫画!!!!!!!!
// @namespace    https://github.com/WuLinLee/manga
// @version      16.3
// @description  bouliubgyobouyfvobybougtfredciuyipngbyvtcruul
// @author       ai为人类服务
// @match        https://mycomic.com/chapters/*
// @match        https://mycomic.com/cn/chapters/*
// @match        https://*.copy4000.com/*/chapter/*
// @match        https://copy4000.com/*/chapter/*
// @match        https://*.mangacopy.com/*/chapter/*
// @match        https://mangacopy.com/*/chapter/*
// @match        https://komiic.cc/*
// @match        https://*.komiic.cc/*
// @match        https://komiic.com/*
// @match        https://*.komiic.com/*
// @match        https://mangadex.org/*
// @match        https://*.mangadex.org/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/WuLinLee/manga/main/manga.user.js
// @updateURL    https://raw.githubusercontent.com/WuLinLee/manga/main/manga.user.js
// ==/UserScript==

(function() {
    'use strict';
    const host = location.hostname;

    function waitFor(selector, callback, timeout = 10000) {
        const el = document.querySelector(selector);
        if (el) return callback(el);
        const observer = new MutationObserver((_, obs) => {
            const target = document.querySelector(selector);
            if (target) { obs.disconnect(); callback(target); }
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), timeout);
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    // ==================== 1. mycomic.com ====================
    if (host.includes('mycomic.com')) {
        const style = document.createElement('style');
        style.textContent = `
            header, [class*="fixed bottom-0 left-0 right-0"] {
                position: fixed !important; left: 0 !important; right: 0 !important;
                height: 0 !important; min-height: 0 !important; overflow: visible !important;
                z-index: 999 !important; background: transparent !important;
                border: none !important; box-shadow: none !important;
            }
            header > *, [class*="fixed bottom-0 left-0 right-0"] > * {
                opacity: 0 !important; transition: opacity 0.2s !important;
            }
            header:hover, [class*="fixed bottom-0 left-0 right-0"]:hover {
                height: auto !important; min-height: 60px !important;
                background: rgba(0,0,0,0.85) !important;
            }
            header:hover > *, [class*="fixed bottom-0 left-0 right-0"]:hover > * { opacity: 1 !important; }
            header { top: 0 !important; }
            [class*="fixed bottom-0 left-0 right-0"] { bottom: 0 !important; }

            header::after {
                content: "" !important; position: absolute !important;
                right: 8px !important; top: 100% !important; width: 10px !important; height: 25px !important;
                background: rgba(0,0,0,0.5) !important; border: 1px solid rgba(255,255,255,0.6) !important;
                border-radius: 5px !important; box-shadow: 0 0 3px rgba(0,0,0,0.3) !important;
                cursor: pointer !important; z-index: 1000 !important;
            }
            [class*="fixed bottom-0 left-0 right-0"]::before {
                content: "" !important; position: absolute !important;
                right: 8px !important; bottom: 100% !important; width: 10px !important; height: 25px !important;
                background: rgba(0,0,0,0.5) !important; border: 1px solid rgba(255,255,255,0.6) !important;
                border-radius: 5px !important; box-shadow: 0 0 3px rgba(0,0,0,0.3) !important;
                cursor: pointer !important; z-index: 1000 !important;
            }

            html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }

            .mc-page-indicator {
                position: fixed !important; top: 4px !important; right: 28px !important;
                min-width: 32px !important; padding: 2px 5px !important;
                background: rgba(0,0,0,0.5) !important; color: white !important;
                font-size: 11px !important; font-weight: 400 !important; text-align: center !important;
                z-index: 1001 !important; pointer-events: auto !important; user-select: none !important;
                letter-spacing: 0.3px !important; border-radius: 3px !important;
                white-space: nowrap !important; cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);

        let pageIndicator = null;
        function getCurrentPageInfo() {
            const btns = document.querySelectorAll('.page-selector');
            if (!btns.length) return { current: 0, total: 0 };
            let current = 1;
            btns.forEach((b, i) => { if (b.classList.contains('text-red-600') || b.classList.contains('dark:text-red-500')) current = i + 1; });
            return { current, total: btns.length };
        }
        function updatePageDisplay() {
            if (!pageIndicator) return;
            const { current, total } = getCurrentPageInfo();
            pageIndicator.textContent = total > 0 ? `${current}/${total}` : '';
        }
        function createPageIndicator() {
            if (pageIndicator) return;
            const el = document.createElement('div'); el.className = 'mc-page-indicator';
            el.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });
            document.body.appendChild(el); pageIndicator = el; updatePageDisplay();
        }
        function goToPage(delta) {
            const btns = document.querySelectorAll('.page-selector'); if (!btns.length) return;
            let idx = -1;
            btns.forEach((b, i) => { if (b.classList.contains('text-red-600') || b.classList.contains('dark:text-red-500')) idx = i; });
            if (idx === -1) {
                const container = document.querySelector('[x-data]');
                if (container?.__x?.$data?.currentPage !== undefined) idx = container.__x.$data.currentPage - 1;
            }
            const newIdx = idx + delta;
            if (idx >= 0 && newIdx >= 0 && newIdx < btns.length) { btns[newIdx].click(); setTimeout(updatePageDisplay, 50); setTimeout(updatePageDisplay, 200); }
        }
        document.addEventListener('click', function(e) {
            const img = e.target.closest('img');
            if (!img) return;
            if (e.target.closest('header, [class*="fixed bottom-0"], a, button, .page-selector, input, textarea, .mc-page-indicator')) return;
            goToPage(e.clientY < window.innerHeight / 2 ? -1 : 1);
        });
        document.addEventListener('click', function(e) { if (e.target.closest('.page-selector')) { setTimeout(updatePageDisplay, 50); setTimeout(updatePageDisplay, 200); } });
        let scrollTimeout;
        window.addEventListener('scroll', function() { clearTimeout(scrollTimeout); scrollTimeout = setTimeout(updatePageDisplay, 300); });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createPageIndicator);
        else createPageIndicator();
    }

       // ==================== 2. 拷贝漫画（修复选择器兼容性） ====================
    if (host.includes('copy4000.com') || host.includes('mangacopy.com')) {
        const style = document.createElement('style');
        style.textContent = `
            .container-fluid.comicContent,
            .container[class*="comic-size-"],
            .comicContent-list[class*="comic-size-"],
            .comicContainerAds {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 100% !important;
                margin-left: auto !important;
                margin-right: auto !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                box-sizing: border-box !important;
                display: flex !important;
                justify-content: center !important;
                flex-wrap: wrap;
            }
            img { max-width: 100% !important; max-height: 100vh !important; width: auto !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
            html, body { margin: 0 !important; padding: 0 !important; }
            .header { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; height: 0 !important; overflow: visible !important; z-index: 999 !important; background: transparent !important; border: none !important; box-shadow: none !important; color: transparent !important; transition: height 0.2s, background 0.2s, color 0.2s !important; }
            .header:hover { height: auto !important; min-height: 60px !important; background: rgba(0,0,0,0.85) !important; color: white !important; }
            .header:hover * { color: white !important; }
            .header::after { content: "" !important; position: absolute !important; right: 2px !important; top: 100% !important; width: 8px !important; height: 20px !important; background: rgba(255,255,255,0.9) !important; border: 1px solid rgba(255,255,255,1) !important; border-radius: 4px !important; box-shadow: 0 0 3px rgba(0,0,0,0.2) !important; cursor: pointer !important; z-index: 1000 !important; }
            .footer { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; height: 0 !important; overflow: visible !important; z-index: 999 !important; background: transparent !important; border: none !important; box-shadow: none !important; color: transparent !important; transition: height 0.2s, background 0.2s, color 0.2s !important; }
            .footer, .footer * { color: transparent !important; background: transparent !important; border-color: transparent !important; box-shadow: none !important; }
            .footer:hover { height: auto !important; min-height: 50px !important; background: rgba(0,0,0,0.85) !important; color: white !important; }
            .footer:hover, .footer:hover * { color: white !important; }
            .footer:hover a, .footer:hover button { background: rgba(255,255,255,0.15) !important; }
            .footer::before { content: "" !important; position: absolute !important; right: 2px !important; bottom: 100% !important; width: 8px !important; height: 20px !important; background: rgba(255,255,255,0.9) !important; border: 1px solid rgba(255,255,255,1) !important; border-radius: 4px !important; box-shadow: 0 0 3px rgba(0,0,0,0.2) !important; cursor: pointer !important; z-index: 1000 !important; }
            html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
        `;
        document.head.appendChild(style);

        let copyBindTimeout = null;
        function bindCopyPageFullscreen() {
            const container = document.querySelector('.comicIndex')?.parentElement;
            if (container && !container.dataset.fullscreenBound) {
                container.dataset.fullscreenBound = '1';
                container.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });
                container.style.cursor = 'pointer';
                container.style.background = 'transparent';
                container.style.color = 'black';
            }
        }
        bindCopyPageFullscreen();
        const copyObserver = new MutationObserver(() => {
            if (copyBindTimeout) return;
            copyBindTimeout = setTimeout(() => {
                bindCopyPageFullscreen();
                copyBindTimeout = null;
            }, 500);
        });
        copyObserver.observe(document.body, { childList: true, subtree: true });
    }
  // ==================== 3. komiic（下页禁用时也记录总页数） ====================
if (host.includes('komiic.cc') || host.includes('komiic.com')) {
    const READING_PATH_REGEX = /\/chapter\/\d+\/page\/\d+/;
    const STYLE_ID = 'komiic-immersive-style';

    function isReadingPage() { return READING_PATH_REGEX.test(location.pathname); }

    let knownTotal = 0, lastChapterId = null;
    let kcIndicator = null, updateTimer = null, scrollTimer = null;
    let autoForwardActive = false;
    let autoBackwardActive = false;

    function getChapterId() { const m = location.pathname.match(/\/chapter\/(\d+)/); return m ? m[1] : null; }

    function injectStyles() {
        const old = document.getElementById(STYLE_ID); if (old) old.remove();
        const style = document.createElement('style'); style.id = STYLE_ID;
        style.textContent = `
            header:not(.v-bottom-navigation), nav, .v-breadcrumbs { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; height: 0 !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; z-index: 200 !important; background: transparent !important; border: none !important; box-shadow: none !important; }
            header:not(.v-bottom-navigation) > *, nav > *, .v-breadcrumbs > * { opacity: 0 !important; transition: opacity 0.2s !important; }
            header:not(.v-bottom-navigation):hover, nav:hover, .v-breadcrumbs:hover { height: auto !important; min-height: 60px !important; background: rgba(0,0,0,0.85) !important; }
            header:not(.v-bottom-navigation):hover > *, nav:hover > *, .v-breadcrumbs:hover > * { opacity: 1 !important; }
            header:not(.v-bottom-navigation)::after, nav::after, .v-breadcrumbs::after { content: "" !important; position: absolute !important; right: 8px !important; top: 0 !important; width: 10px !important; height: 25px !important; background: rgba(0,0,0,0.5) !important; border: 1px solid rgba(255,255,255,0.6) !important; border-radius: 5px !important; box-shadow: 0 0 3px rgba(0,0,0,0.3) !important; cursor: pointer !important; z-index: 300 !important; }
            header.v-bottom-navigation { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; top: auto !important; height: 0 !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; z-index: 200 !important; background: transparent !important; border: none !important; box-shadow: none !important; }
            header.v-bottom-navigation > * { opacity: 0 !important; transition: opacity 0.2s !important; }
            header.v-bottom-navigation:hover { height: auto !important; min-height: 50px !important; background: rgba(0,0,0,0.85) !important; }
            header.v-bottom-navigation:hover > * { opacity: 1 !important; }
            header.v-bottom-navigation::before { content: "" !important; position: absolute !important; right: 8px !important; bottom: 0 !important; width: 10px !important; height: 25px !important; background: rgba(0,0,0,0.5) !important; border: 1px solid rgba(255,255,255,0.6) !important; border-radius: 5px !important; box-shadow: 0 0 3px rgba(0,0,0,0.3) !important; cursor: pointer !important; z-index: 300 !important; }
            html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
            .kc-page-indicator { position: fixed !important; top: 4px !important; right: 28px !important; min-width: 42px !important; padding: 2px 5px !important; background: rgba(0,0,0,0.5) !important; color: white !important; font-size: 11px !important; font-weight: 400 !important; text-align: center !important; z-index: 300 !important; pointer-events: auto !important; user-select: none !important; letter-spacing: 0.3px !important; border-radius: 3px !important; cursor: pointer !important; white-space: nowrap !important; }
            .kc-fast-forward-btn, .kc-fast-backward-btn {
                position: fixed !important;
                left: 0 !important;
                width: 10px !important;
                height: 25px !important;
                background: rgba(0,0,0,0.5) !important;
                border: 1px solid rgba(255,255,255,0.6) !important;
                border-radius: 5px !important;
                box-shadow: 0 0 3px rgba(0,0,0,0.3) !important;
                cursor: pointer !important;
                z-index: 400 !important;
                transition: background 0.2s !important;
                color: transparent !important;
                font-size: 0 !important;
                line-height: 0 !important;
                text-indent: -9999px !important;
                overflow: hidden !important;
            }
            .kc-fast-backward-btn { top: 0 !important; }
            .kc-fast-forward-btn { bottom: 0 !important; }
            .kc-fast-forward-btn:hover, .kc-fast-backward-btn:hover { background: rgba(0,0,0,0.7) !important; }
            .kc-fast-forward-btn:disabled, .kc-fast-backward-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; background: rgba(0,0,0,0.3) !important; }
        `;
        document.head.appendChild(style);
    }

    function cleanupUI() {
        const styleEl = document.getElementById(STYLE_ID); if (styleEl) styleEl.remove();
        if (kcIndicator) { kcIndicator.remove(); kcIndicator = null; }
        const btns = document.querySelectorAll('.kc-fast-forward-btn, .kc-fast-backward-btn');
        btns.forEach(b => b.remove());
        if (updateTimer) { clearTimeout(updateTimer); updateTimer = null; }
        if (scrollTimer) { clearTimeout(scrollTimer); scrollTimer = null; }
        window._komiicEventsBound = false;
    }

    function getPageInfo() {
        const nav = document.querySelector('header.v-bottom-navigation'); if (!nav) return { current: 0, isLast: false };
        const btn = nav.querySelector('button[aria-haspopup="menu"]'); let current = 0;
        if (btn) { const content = btn.querySelector('.v-btn__content'); if (content) { const match = content.textContent.trim().match(/(\d+)页/); if (match) current = parseInt(match[1]); } }
        let isLast = false; const allButtons = nav.querySelectorAll('button');
        for (const b of allButtons) { if (b.textContent.trim() === '下一话' || b.textContent.trim() === '下一話') { isLast = true; break; } }
        return { current, isLast };
    }

    function updatePageIfChanged() {
        if (!kcIndicator) return;
        const { current, isLast } = getPageInfo(); if (current <= 0) return;
        const chapterId = getChapterId();
        if (chapterId !== lastChapterId) { knownTotal = 0; lastChapterId = chapterId; }
        if (isLast) knownTotal = current;
        if (knownTotal > 0) kcIndicator.textContent = `${current}页/${knownTotal}`;
        else kcIndicator.textContent = `${current}页`;
    }

    function createKomiicIndicator() {
        if (kcIndicator) return;
        const el = document.createElement('div'); el.className = 'kc-page-indicator';
        el.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });
        document.body.appendChild(el); kcIndicator = el;
        updatePageIfChanged();
    }

    // 快进（连续点击"下页"）—— 下页禁用时也记录总页数
    function fastForward(btnElement) {
        if (autoForwardActive) return;
        autoForwardActive = true;
        btnElement.disabled = true;

        let count = 0;
        const MAX_CLICKS = 50;

        function clickNext() {
            const nav = document.querySelector('header.v-bottom-navigation');
            if (!nav) { stop(); return; }
            const allButtons = nav.querySelectorAll('button');

            // 查找"下页"按钮
            let nextBtn = null;
            for (const b of allButtons) {
                const text = b.textContent.trim();
                if (text === '下页' || text === '下頁') { nextBtn = b; break; }
            }

            // ★ 检测"下页"按钮是否被禁用 → 记录总页数后停止
            if (nextBtn && (nextBtn.disabled || nextBtn.getAttribute('disabled') !== null)) {
                const { current } = getPageInfo();
                if (current > 0) knownTotal = current;
                stop();
                return;
            }

            // 检查是否已出现"下一话"
            let foundNextChapter = false;
            for (const b of allButtons) {
                const text = b.textContent.trim();
                if (text === '下一话' || text === '下一話') { foundNextChapter = true; break; }
            }
            if (foundNextChapter || count >= MAX_CLICKS) { stop(); return; }

            if (nextBtn) { nextBtn.click(); count++; setTimeout(clickNext, 50); }
            else stop();
        }

        function stop() {
            autoForwardActive = false;
            btnElement.disabled = false;
            updatePageIfChanged();
        }

        clickNext();
    }

    // 回退（连续点击"上页"）
    function fastBackward(btnElement) {
        if (autoBackwardActive) return;
        autoBackwardActive = true;
        btnElement.disabled = true;

        let count = 0;
        const MAX_CLICKS = 50;

        function clickPrev() {
            const nav = document.querySelector('header.v-bottom-navigation');
            if (!nav) { stop(); return; }
            const allButtons = nav.querySelectorAll('button');

            let prevBtn = null;
            for (const b of allButtons) {
                const text = b.textContent.trim();
                if (text === '上页' || text === '上頁') { prevBtn = b; break; }
            }
            if (!prevBtn) { stop(); return; }
            if (prevBtn.disabled || prevBtn.getAttribute('disabled') !== null) { stop(); return; }

            prevBtn.click();
            count++;
            if (count >= MAX_CLICKS) { stop(); return; }
            setTimeout(clickPrev, 50);
        }

        function stop() {
            autoBackwardActive = false;
            btnElement.disabled = false;
            updatePageIfChanged();
        }

        clickPrev();
    }

    function createFastButtons() {
        if (document.querySelector('.kc-fast-forward-btn')) return;
        const fwBtn = document.createElement('div');
        fwBtn.className = 'kc-fast-forward-btn';
        fwBtn.title = '快速翻到最后一页';
        fwBtn.addEventListener('click', () => fastForward(fwBtn));

        const bwBtn = document.createElement('div');
        bwBtn.className = 'kc-fast-backward-btn';
        bwBtn.title = '快速回到第一页';
        bwBtn.addEventListener('click', () => fastBackward(bwBtn));

        document.body.appendChild(fwBtn);
        document.body.appendChild(bwBtn);
    }

    function activateKomiic() {
        cleanupUI(); injectStyles();
        waitFor('header.v-bottom-navigation', () => {
            createKomiicIndicator();
            createFastButtons();
            if (!window._komiicEventsBound) {
                window._komiicEventsBound = true;
                document.addEventListener('click', function(e) { if (e.target.closest('header, nav, a, button, .v-breadcrumbs, input, textarea, .kc-page-indicator, .kc-fast-forward-btn, .kc-fast-backward-btn')) return; clearTimeout(updateTimer); updateTimer = setTimeout(updatePageIfChanged, 300); });
                window.addEventListener('scroll', function() { clearTimeout(scrollTimer); scrollTimer = setTimeout(updatePageIfChanged, 300); });
            }
        });
    }

    if (isReadingPage()) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', activateKomiic); else activateKomiic(); }

    let lastPath = location.pathname;
    new MutationObserver(() => {
        if (location.pathname !== lastPath) { lastPath = location.pathname; if (isReadingPage()) activateKomiic(); else { cleanupUI(); knownTotal = 0; lastChapterId = null; } }
    }).observe(document.body, { childList: true, subtree: true });
}

   // ==================== 4. mangadex.org ====================
if (host.includes('mangadex.org')) {
    const style = document.createElement('style');
    style.textContent = `
        .reader--meta.page {
            cursor: pointer !important;
            pointer-events: auto !important;
            background: rgba(0,0,0,0.5) !important;
            color: white !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            font-weight: 400 !important;
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 1001 !important;
        }
        html, body {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    document.addEventListener('click', function(e) {
        if (e.target.closest('.reader--meta.page')) {
            e.stopPropagation();
            toggleFullscreen();
        }
    });
}
})();
