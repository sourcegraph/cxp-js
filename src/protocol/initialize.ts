import { ConfigurationCascade } from '../extension'
import { NotificationType, RequestType } from '../jsonrpc2/messages'
import { URI } from '../types/textDocument'
import { ClientCapabilities, ServerCapabilities } from './capabilities'
import { WorkspaceFoldersInitializeParams } from './workspaceFolder'

/**
 * The initialize request is sent from the client to the server. It is sent once as the request after starting up
 * the server. The requests parameter is of type [InitializeParams](#InitializeParams) the response if of type
 * [InitializeResult](#InitializeResult) of a Thenable that resolves to such.
 */
export namespace InitializeRequest {
    export const type = new RequestType<InitializeParams, InitializeResult, InitializeError, void>('initialize')
}

/**
 * The initialize parameters
 */
// tslint:disable-next-line:class-name
export interface _InitializeParams {
    /**
     * The root URI of the workspace.
     *
     * TODO(sqs): Figure out our story around roots, multi-roots, workspace folders, etc.
     */
    root: URI | null

    /**
     * The capabilities provided by the client (editor or tool)
     */
    capabilities: ClientCapabilities

    /**
     * The configuration at initialization time. If the configuration changes on the client, the client will report
     * the update to the extension by sending a `workspace/didChangeConfiguration`
     * ({@link DidChangeConfigurationNotification}) notification.
     */
    configurationCascade: ConfigurationCascade

    /**
     * Custom initialization options.
     */
    initializationOptions?: any

    /**
     * The initial trace setting. If omitted trace is disabled ('off').
     */
    trace?: 'off' | 'messages' | 'verbose'
}

export type InitializeParams = _InitializeParams & WorkspaceFoldersInitializeParams

/**
 * The result returned from an initialize request.
 */
export interface InitializeResult {
    /**
     * The capabilities the language server provides.
     */
    capabilities: ServerCapabilities
    /**
     * Custom initialization results.
     */
    [custom: string]: any
}

/**
 * Known error codes for an `InitializeError`;
 */
export namespace InitializeError {
    /**
     * If the protocol version provided by the client can't be handled by the server.
     * @deprecated This initialize error got replaced by client capabilities. There is
     * no version handshake in version 3.0x
     */
    export const unknownProtocolVersion = 1
}

/**
 * The data type of the ResponseError if the
 * initialize request fails.
 */
export interface InitializeError {
    /**
     * Indicates whether the client execute the following retry logic:
     * (1) show the message provided by the ResponseError to the user
     * (2) user selects retry or cancel
     * (3) if user selected retry the initialize method is sent again.
     */
    retry: boolean
}

export interface InitializedParams {}

/**
 * The intialized notification is sent from the client to the
 * server after the client is fully initialized and the server
 * is allowed to send requests from the server to the client.
 */
export namespace InitializedNotification {
    export const type = new NotificationType<InitializedParams, void>('initialized')
}

/**
 * A shutdown request is sent from the client to the server.
 * It is sent once when the client decides to shutdown the
 * server. The only notification that is sent after a shutdown request
 * is the exit event.
 */
export namespace ShutdownRequest {
    export const type = new RequestType<null, void, void, void>('shutdown')
}

/**
 * The exit event is sent from the client to the server to
 * ask the server to exit its process.
 */
export namespace ExitNotification {
    export const type = new NotificationType<null, void>('exit')
}
