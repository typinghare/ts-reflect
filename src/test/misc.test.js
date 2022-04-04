"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("../misc");
describe('misc tests', function () {
    it('should find the specified element', function () {
        const set = new Set(['What', 'Which', 'Why', 'When', 'Who', 'How']);
        expect((0, misc_1.findOne)(set, (e) => e.includes('H'))).toEqual('How');
        expect((0, misc_1.findOne)(set, (e) => e.includes('Z'))).toBeNull();
    });
});
