import { ReferenceParams } from '../protocol'
import { ObservableEnvironment } from './environment'
import { Extension } from './extension'
import { CommandRegistry } from './providers/command'
import { ContributionRegistry } from './providers/contribution'
import { TextDocumentDecorationProviderRegistry } from './providers/decoration'
import { TextDocumentHoverProviderRegistry } from './providers/hover'
import { TextDocumentLocationProviderRegistry } from './providers/location'

/** Registries is a container for all provider registries. */
export class Registries<X extends Extension> {
    constructor(private environment: ObservableEnvironment<X>) {}

    public readonly commands = new CommandRegistry()
    public readonly contribution = new ContributionRegistry(this.environment.context)
    public readonly textDocumentDefinition = new TextDocumentLocationProviderRegistry()
    public readonly textDocumentImplementation = new TextDocumentLocationProviderRegistry()
    public readonly textDocumentReferences = new TextDocumentLocationProviderRegistry<ReferenceParams>()
    public readonly textDocumentTypeDefinition = new TextDocumentLocationProviderRegistry()
    public readonly textDocumentHover = new TextDocumentHoverProviderRegistry()
    public readonly textDocumentDecoration = new TextDocumentDecorationProviderRegistry()
}
