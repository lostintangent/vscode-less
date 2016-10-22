'use strict';

import * as assert from 'assert';

import { TextDocument } from 'vscode-languageserver';
import { getLESSLanguageService } from 'vscode-css-languageservice';

import { getCacheStorage } from '../../services/cache';
import { doHover } from '../../providers/hover';
import { ISettings } from '../../types/settings';

const ls = getLESSLanguageService();

ls.configure({
	lint: false,
	validate: false
});

interface IHover {
	language: string;
	value: string;
}

describe('Providers/Hover', () => {

	it('doHover', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
			document: 'test.less',
			variables: [
				{
					name: '@test',
					value: '1',
					offset: 0
				}
			],
			mixins: [
				{
					name: '.test',
					parameters: [],
					offset: 0
				}
			],
			imports: []
		});

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true
		};

		const document = TextDocument.create('test.less', 'less', 1, [
			'@test: 1;',
			'.test() {}'
		].join('\n'));

		// Variable
		const variableHover: IHover = <any>doHover(document, 2, cache, settings).contents;

		assert.equal(variableHover.language, 'less');
		assert.equal(variableHover.value, '@test: 1');

		// Mixin
		const mixinHover: IHover = <any>doHover(document, 12, cache, settings).contents;

		assert.equal(mixinHover.language, 'less');
		assert.equal(mixinHover.value, '.test() {…}');
	});

	it('issue-8', () => {
		const cache = getCacheStorage();

		cache.set('test.less', {
			document: 'test.less',
			variables: [],
			mixins: [
				{
					name: '.a',
					parameters: [],
					offset: 0
				},
				{
					name: '.b',
					parameters: [],
					offset: 0
				}
			],
			imports: []
		});

		const settings = <ISettings>{
			scannerExclude: [],
			scannerDepth: 20,
			showErrors: false,
			suggestMixins: true,
			suggestVariables: true
		};

		const document = TextDocument.create('test.less', 'less', 1, [
			'.a() {',
			'  .b() {}',
			'  .b();',
			'}'
		].join('\n'));

		// Mixin
		const mixinHover: IHover = <any>doHover(document, 21, cache, settings).contents;

		assert.equal(mixinHover.language, 'less');
		assert.equal(mixinHover.value, '.b() {…}');
	});

});
