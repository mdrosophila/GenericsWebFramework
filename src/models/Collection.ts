import axios, {AxiosResponse} from "axios"
import { Eventing } from "./Eventing";

export class Collection<T, K> {
    models: T[] = [];
    eventing: Eventing = new Eventing();

    constructor(public rootUrl: string,
                public deserialize: (json: K) => T) {

    }

    get on() {
        return this.eventing.on;
    }

    get trigger() {
        return this.eventing.trigger;
    }

    fetch(): void {
        axios.get(this.rootUrl)
            .then((response: AxiosResponse) => {
                response.data.forEach((value: K) => {
                    this.models.push(this.deserialize(value));
                });
                this.trigger("change");
            });
    }
}