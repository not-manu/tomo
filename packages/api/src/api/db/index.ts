import type { DrizzleAdapterConfig } from "better-auth/adapters/drizzle";
import {
	blob,
	customType,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { Core } from "../../core";
import type { DbAPI } from "./api";

export namespace Db {
	export const Provider = "sqlite" satisfies DrizzleAdapterConfig["provider"];
	export type Type = ReturnType<typeof DbAPI.connect>;
	export type Tx = Parameters<Parameters<Type["transaction"]>[0]>[0];
	export type Client = Type | Tx;

	export const Id = Core.Id;
	export const Table = sqliteTable;
	export const Text = text;
	export const Int = integer;
	export const Bool = (name: string) => integer(name, { mode: "boolean" });
	export const Blob = (name: string) => blob(name, { mode: "buffer" });
	export const Timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });
	export const Now = () => new Date();
	export const IsoTimestamp = customType<{ data: string; driverData: number }>({
		dataType: () => "integer",
		toDriver: (value) => Date.parse(value),
		fromDriver: (value) => new Date(value).toISOString(),
	});
	export const Index = index;
	export const UniqueIndex = uniqueIndex;
	export const PrimaryKey = primaryKey;

	export function transaction<T>(db: Type, fn: (tx: Tx) => T) {
		return db.transaction(fn);
	}
}
