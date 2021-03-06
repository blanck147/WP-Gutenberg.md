/** @format */
/**
 * External dependencies
 */
import { get, has } from 'lodash';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { getPlugin, registerPlugin, unregisterPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import getGMDData from './get-gmd-data';
import extensions from '../editor';

/**
 * Refreshes registration of Gutenberg extensions (blocks and plugins)
 *
 * Uses block and plugin availability information obtained from the server to conditionally
 * register and/or unregister blocks and plugins accordingly
 *
 * @returns {void}
 */
export default function refreshRegistrations() {
	const extensionAvailability = get( getGMDData(), [ 'available_blocks' ] );

	if ( ! extensionAvailability ) {
		return;
	}
	extensions.forEach( extension => {
		const { name, settings } = extension;
		const available = get( extensionAvailability, [ name, 'available' ] );

		if ( has( settings, [ 'render' ] ) ) {
			// If the extension has a `render` method, it's not a block but a plugin
			const pluginName = `gmd-${ name }`;
			const registered = getPlugin( pluginName );

			if ( available && ! registered ) {
				registerPlugin( pluginName, settings );
			} else if ( ! available && registered ) {
				unregisterPlugin( pluginName );
			}
		} else {
			const blockName = `gmd/${ name }`;
			const registered = getBlockType( blockName );

			if ( available && ! registered ) {
				registerBlockType( blockName, settings );
			} else if ( ! available && registered ) {
				unregisterBlockType( blockName );
			}
		}
	} );
}
