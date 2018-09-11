import { Unsubscribable } from 'rxjs'
import { ClientCapabilities, InitializeParams } from '../../protocol'
import { MessageType as RPCMessageType } from '../../protocol/jsonrpc2/messages'
import { isFunction } from '../../util'
import { Client } from '../client'

/** A client feature that exposes functionality that is always enabled. */
export interface StaticFeature {
    fillInitializeParams?: (params: InitializeParams) => void
    fillClientCapabilities?: (capabilities: ClientCapabilities) => void

    /**
     * Called when the client connection is initializing. The feature can add client request and notification
     * listeners in this method.
     */
    initialize?: () => void

    /** Free resources acquired in initialize. */
    deinitialize?: () => void
}

/** Common arguments used when registering a dynamic feature. */
export interface RegistrationData<T> {
    id: string
    registerOptions: T
    overwriteExisting?: boolean
}

/** A client feature that exposes functionality that the server can enable, configure, and disable. */
export interface DynamicFeature<T> {
    messages: RPCMessageType | RPCMessageType[]
    fillInitializeParams?: (params: InitializeParams) => void
    fillClientCapabilities(capabilities: ClientCapabilities): void
    register(message: RPCMessageType, data: RegistrationData<T>): void
    unregister(id: string): void

    /**
     * Unregisters all registrations and prepares the feature to be reused for a new connection.
     */
    unregisterAll(): void
}

export namespace DynamicFeature {
    /** Reports whether the value is a DynamicFeature. */
    export function is<T>(value: any): value is DynamicFeature<T> {
        const candidate: DynamicFeature<T> = value
        return (
            candidate &&
            // tslint:disable-next-line:no-unbound-method
            isFunction(candidate.register) &&
            // tslint:disable-next-line:no-unbound-method
            isFunction(candidate.unregister) &&
            // tslint:disable-next-line:no-unbound-method
            isFunction(candidate.unregisterAll) &&
            candidate.messages !== void 0
        )
    }
}

/** Common base class for client features. */
export abstract class Feature<O> implements DynamicFeature<O> {
    private subscriptionsByID = new Map<string, Unsubscribable>()

    constructor(protected client: Client) {}

    public abstract get messages(): RPCMessageType

    /**
     * validateRegistrationOptions validates a proposed options object. This is used by the register
     * method to verify registration options. At a minimum, the options
     * object should conform to O (the options type of a Feature subclass).
     *
     * Implementors of this method should return the original options object unmodified if it is
     * valid and throw an error if it is invalid (i.e., does not satisfy the type).
     *
     * @param options the options object to validate
     */
    protected abstract validateRegistrationOptions(options: any): O

    public register(message: RPCMessageType, data: RegistrationData<any>): void {
        const registerOptions = this.validateRegistrationOptions(data.registerOptions)
        if (message.method !== this.messages.method) {
            throw new Error(
                `Register called on wrong feature. Requested ${message.method} but reached feature ${
                    this.messages.method
                }`
            )
        }
        if (this.subscriptionsByID.has(data.id)) {
            throw new Error(`registration already exists with ID ${data.id}`)
        }
        this.subscriptionsByID.set(data.id, this.registerProvider(registerOptions))
    }

    protected abstract registerProvider(options: O): Unsubscribable

    public abstract fillClientCapabilities(capabilities: ClientCapabilities): void

    public unregister(id: string): void {
        const sub = this.subscriptionsByID.get(id)
        if (!sub) {
            throw new Error(`no registration with ID ${id}`)
        }
        sub.unsubscribe()
        this.subscriptionsByID.delete(id)
    }

    public unregisterAll(): void {
        for (const sub of this.subscriptionsByID.values()) {
            sub.unsubscribe()
        }
        this.subscriptionsByID.clear()
    }
}

export function ensure<T, K extends keyof T>(target: T, key: K): T[K] {
    if (target[key] === void 0) {
        target[key] = {} as any
    }
    return target[key]
}
