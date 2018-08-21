import { Subscription } from 'rxjs'
import { createMessageConnection, Logger, MessageConnection, MessageTransports } from '../jsonrpc2/connection'
import {
    ConfigurationCascade,
    InitializedNotification,
    InitializeParams,
    InitializeRequest,
    InitializeResult,
} from '../protocol'
import { URI } from '../types/textDocument'
import { Commands, Configuration, CXP, ExtensionContext, Observable, Window, Windows } from './api'
import { createExtCommands } from './features/commands'
import { createExtConfiguration } from './features/configuration'
import { createExtContext } from './features/context'
import { createExtWindows } from './features/windows'

class ExtensionHandle<C> implements CXP<C> {
    public readonly configuration: Configuration<C> & Observable<C>
    public readonly windows: Windows & Observable<Window[]>
    public readonly commands: Commands
    public readonly context: ExtensionContext

    private subscription = new Subscription()

    constructor(public readonly rawConnection: MessageConnection, public readonly initializeParams: InitializeParams) {
        this.subscription.add(this.rawConnection)

        this.configuration = createExtConfiguration<C>(
            this,
            initializeParams.configurationCascade as ConfigurationCascade<C>
        )
        this.windows = createExtWindows(this)
        this.commands = createExtCommands(this)
        this.context = createExtContext(this)
    }

    public get root(): URI | null {
        return this.initializeParams.root
    }

    public close(): void {
        this.subscription.unsubscribe()
    }
}

const consoleLogger: Logger = {
    error(message: string): void {
        console.error(message)
    },
    warn(message: string): void {
        console.warn(message)
    },
    info(message: string): void {
        console.info(message)
    },
    log(message: string): void {
        console.log(message)
    },
}

/**
 * Activates a CXP extension by calling its `run` entrypoint function with the CXP API handle as the first
 * argument.
 *
 * @template C the extension's settings
 * @param transports The message reader and writer to use for communication with the client.
 * @param run The extension's `run` entrypoint function.
 * @return A promise that resolves when the extension's `run` function has been called.
 */
export function activateExtension<C>(
    transports: MessageTransports,
    run: (cxp: CXP<C>) => void | Promise<void>
): Promise<void> {
    const connection = createMessageConnection(transports, consoleLogger)
    return new Promise<void>(resolve => {
        let initializationParams!: InitializeParams
        connection.onRequest(InitializeRequest.type, params => {
            initializationParams = params
            return {
                capabilities: {
                    textDocumentSync: { openClose: true },
                    decorationProvider: true,
                },
            } as InitializeResult
        })
        connection.onNotification(InitializedNotification.type, () => {
            run(new ExtensionHandle<C>(connection, initializationParams))
            resolve()
        })

        connection.listen()
    })
}
