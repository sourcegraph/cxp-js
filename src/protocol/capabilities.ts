import { CommandClientCapabilities } from './command'
import { ContributionClientCapabilities } from './contribution'
import { ImplementationClientCapabilities } from './implementation'
import { TextDocumentClientCapabilities } from './textDocument'
import { TypeDefinitionClientCapabilities } from './typeDefinition'

/**
 * Defines the capabilities provided by the client.
 */
// tslint:disable-next-line:class-name
export interface _ClientCapabilities {
    /**
     * Text document specific client capabilities.
     */
    textDocument?: TextDocumentClientCapabilities

    /**
     * Experimental client capabilities.
     */
    experimental?: any
}

export type ClientCapabilities = _ClientCapabilities &
    CommandClientCapabilities &
    ImplementationClientCapabilities &
    TypeDefinitionClientCapabilities &
    ContributionClientCapabilities
