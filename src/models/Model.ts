import { Callback } from "./types";
import { AxiosPromise, AxiosResponse } from "axios";
import { HasId } from "./types";

interface ModelAttribute<T> {
    set(update: T): void;
    getAll(): T;
    get <K extends keyof T>(key: K): T[K];
}

interface Sync<T> {
    fetch(id: number): AxiosPromise;
    save(data: T): AxiosPromise
}

interface Events {
    on(eventName: string, callback: Callback) : void;
    trigger(eventName: string): void;
}

export class Model<T extends HasId> {
    /**
     * Properties attributes, eventing and sync must be initiated in constructor's
     * parameters. If they are initiated inside the constructor's body, change
     * the format "on = this.eventing.on" to
     * get on () { return this.eventing.on }
     */
    constructor(private attributes: ModelAttribute<T>,
                private eventing: Events,
                private sync: Sync<T>) {
    }
    on = this.eventing.on;
    get = this.attributes.get;
    trigger = this.eventing.trigger;

    set(update: T): void {
        this.attributes.set(update);
        this.trigger("change");
    }

    fetch(): void {
        const id = this.get("id");
        if (typeof id !== "number") {
            throw new Error("Can not fetch without id");
        }
        this.sync.fetch(id).then((response: AxiosResponse): void => {
            this.set(response.data);
        });
    }

    save(): void {
        this.sync.save(this.attributes.getAll())
            .then((response: AxiosResponse) => {
                this.trigger("save");
            })
            .catch(() => {
                this.trigger("error");
            });
    }
}