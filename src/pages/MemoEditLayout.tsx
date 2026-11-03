import type { ChangeEvent } from "react";
import "../styles/memo-edit-layout.css";

type Data = Record<string, any>;
type Leaf = { path: string; label: string; value: unknown };

const sectionLabel: Record<string, string> = {
  programInfo: "Informasi Program",
  pendapatan: "Informasi Program / Sewa",
  onProducts: "Produk On Faktur",
  onRows: "Rincian On Faktur",
  offProducts: "Produk Off Faktur",
  offRows: "Rincian Off Faktur",
  updateInfo: "Update Informasi Produk",
  budgetLink: "Anggaran Program",
  catatan: "Catatan Supplier",
  signature: "Tanda Tangan",
};

const heading = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_.-]/g, " ")
    .replace(/\bPpn\b/i, "PPN")
    .replace(/\bPph\b/i, "PPh")
    .replace(/^./, (char) => char.toUpperCase());

const isRecord = (value: unknown): value is Data =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isMoney = (key: string) => /nominal|harga|budget|biaya|nilai/i.test(key);

function getLeaves(value: unknown, path = ""): Leaf[] {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value !== "object"
  ) {
    return [{ path, label: heading(path.split(".").at(-1) || path), value }];
  }
  if (Array.isArray(value)) {
    return value.length
      ? value.flatMap((item, index) => getLeaves(item, `${path}[${index}]`))
      : [];
  }
  return Object.entries(value).flatMap(([key, item]) =>
    getLeaves(item, path ? `${path}.${key}` : key),
  );
}

function setAtPath(source: Data, path: string, value: unknown): Data {
  const next = structuredClone(source);
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let target: any = next;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) target[key] = value;
    else {
      if (target[key] == null)
        target[key] = /^\d+$/.test(keys[index + 1]) ? [] : {};
      target = target[key];
    }
  });
  return next;
}

function valueLabel(value: unknown, path: string) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Aktif" : "Tidak aktif";
  if (typeof value === "number" && isMoney(path))
    return `Rp ${value.toLocaleString("id-ID")}`;
  return String(value);
}

function activePendapatanLeaves(data: Data) {
  const pendapatan = data.pendapatan as Data | undefined;
  if (!pendapatan) return [];
  const type = String(pendapatan.jenis || "");
  const prefixes =
    type === "listing"
      ? ["listing"]
      : type === "promosi"
        ? ["promosi", "mediaTipe", "mediaKeterangan"]
        : type === "reward-insentif"
          ? ["reward", "target"]
          : type === "sewa-visibility"
            ? ["sewa"]
            : ["event", "namaProgram"];
  return getLeaves(pendapatan, "pendapatan").filter((leaf) => {
    const key = leaf.path.replace("pendapatan.", "");
    return (
      key === "jenis" ||
      prefixes.some((prefix) =>
        key.toLowerCase().startsWith(prefix.toLowerCase()),
      )
    );
  });
}

function Field({
  field,
  data,
  onChange,
  disabled,
}: {
  field: Leaf;
  data: Data;
  onChange: (data: Data) => void;
  disabled: boolean;
}) {
  const isToggle = typeof field.value === "boolean";
  const isNumber = typeof field.value === "number";
  const update = (value: unknown) =>
    onChange(setAtPath(data, field.path, value));
  return (
    <label className="block text-xs font-bold text-slate-600">
      {field.label}
      {isToggle ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => update(!field.value)}
          className={`mt-1 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold ${field.value ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
        >
          <span>{field.value ? "Aktif" : "Tidak aktif"}</span>
          <span
            className={`h-4 w-7 rounded-full p-0.5 ${field.value ? "bg-violet-600" : "bg-slate-300"}`}
          >
            <span
              className={`block h-3 w-3 rounded-full bg-white transition ${field.value ? "translate-x-3" : ""}`}
            />
          </span>
        </button>
      ) : (
        <input
          disabled={disabled}
          type={isNumber ? "number" : "text"}
          value={field.value ?? ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update(isNumber ? Number(event.target.value) : event.target.value)
          }
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-amber-500 disabled:bg-slate-50"
        />
      )}
    </label>
  );
}

function TaxSettings({
  fields,
  data,
  onChange,
  disabled,
}: {
  fields: Leaf[];
  data: Data;
  onChange: (data: Data) => void;
  disabled: boolean;
}) {
  const ppn = fields.filter((field) => /ppn/i.test(field.path));
  const pph = fields.filter((field) => /pph/i.test(field.path));
  if (!ppn.length && !pph.length) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-black text-slate-800">Pengaturan Pajak</h3>
      <p className="mt-1 text-xs text-slate-400">
        Pengaturan ini mengikuti data yang dipilih supplier.
      </p>
      {[
        ["PPN", ppn],
        ["PPh", pph],
      ].map(([name, group]) =>
        (group as Leaf[]).length ? (
          <div
            className="mt-4 border-t pt-4 first:border-t-0 first:pt-0"
            key={String(name)}
          >
            <p className="mb-3 text-xs font-bold text-slate-700">{name}</p>
            <div className="space-y-3">
              {(group as Leaf[]).map((field) => (
                <Field
                  key={field.path}
                  field={field}
                  data={data}
                  onChange={onChange}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </section>
  );
}

function TransactionSection({
  name,
  fields,
  data,
  onChange,
  disabled,
}: {
  name: string;
  fields: Leaf[];
  data: Data;
  onChange: (data: Data) => void;
  disabled: boolean;
}) {
  if (!fields.length) return null;
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-black text-slate-800">
          {sectionLabel[name] || heading(name)}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Data yang diisi supplier pada bagian ini.
        </p>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <Field
            key={field.path}
            field={field}
            data={data}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}

function FakturProductEditor({
  data,
  onChange,
  disabled,
}: {
  data: Data;
  onChange: (data: Data) => void;
  disabled: boolean;
}) {
  const onProducts = Array.isArray(data.onProducts) ? data.onProducts : [];
  const offProducts = Array.isArray(data.offProducts) ? data.offProducts : [];
  const onRows = isRecord(data.onRows) ? data.onRows : {};
  const offRows = isRecord(data.offRows) ? data.offRows : {};
  const products = new Map<string, Data>();
  [...onProducts, ...offProducts].filter(isRecord).forEach((product) => {
    const plu = String(product.plu || product.id || "");
    if (plu) products.set(plu, { ...products.get(plu), ...product });
  });
  [...Object.keys(onRows), ...Object.keys(offRows)].forEach((plu) => {
    if (!products.has(plu)) products.set(plu, { plu, nama: plu });
  });
  if (!products.size) return null;

  const cell = (row: unknown, path: string, emptyLabel: string) => {
    const fields = getLeaves(row, path);
    if (!fields.length)
      return <p className="text-xs text-slate-400">{emptyLabel}</p>;
    return (
      <div className="grid gap-3">
        {fields.map((field) => (
          <Field
            key={field.path}
            field={field}
            data={data}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-black text-slate-800">
          Rincian Produk On Faktur & Off Faktur
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Setiap produk ditampilkan dalam satu baris agar data On Faktur dan Off
          Faktur mudah dibandingkan.
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[200px_minmax(300px,1fr)_minmax(300px,1fr)] border-b bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <div className="px-4 py-3">Produk</div>
            <div className="border-l px-4 py-3 text-amber-700">On Faktur</div>
            <div className="border-l px-4 py-3 text-indigo-700">Off Faktur</div>
          </div>
          {Array.from(products.entries()).map(([plu, product]) => (
            <div
              className="grid grid-cols-[200px_minmax(300px,1fr)_minmax(300px,1fr)] border-b last:border-b-0"
              key={plu}
            >
              <div className="bg-slate-50/50 px-4 py-4">
                <p className="font-mono text-xs font-bold text-slate-700">
                  {plu}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {product.nama || product.name || "—"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {product.satuan || ""}
                </p>
              </div>
              <div className="border-l p-4">
                {cell(onRows[plu], `onRows.${plu}`, "Tidak ada data On Faktur")}
              </div>
              <div className="border-l p-4">
                {cell(
                  offRows[plu],
                  `offRows.${plu}`,
                  "Tidak ada data Off Faktur",
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MemoEditLayout({
  data,
  onChange,
  disabled,
}: {
  data: Data;
  onChange: (data: Data) => void;
  disabled: boolean;
}) {
  const program = (data.programInfo || {}) as Data;
  const activeProgramFields =
    data.jenisMemo === "memo-program"
      ? getLeaves(program, "programInfo")
      : activePendapatanLeaves(data);
  const taxFields = activeProgramFields.filter((field) =>
    /ppn|pph/i.test(field.path),
  );
  const programFields = activeProgramFields.filter(
    (field) => !/ppn|pph/i.test(field.path),
  );
  const otherSections = Object.entries(data)
    .filter(
      ([key]) =>
        ![
          "identity",
          "outlets",
          "jenisMemo",
          "programInfo",
          "pendapatan",
          "onProducts",
          "onRows",
          "offProducts",
          "offRows",
          "signature",
        ].includes(key),
    )
    .map(([name, value]) => ({ name, fields: getLeaves(value, name) }));
  const identity = (data.identity || {}) as Data;
  const supplier = identity.supplier?.name || "—";
  const pic = identity.picName || "—";
  const memoLabel = data.pendapatan?.namaProgram || program.namaProgram || "—";

  return (
    <div className="memo-edit-layout mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b bg-amber-50/60 px-4 py-3">
            <p className="text-sm font-black text-slate-800">Informasi Memo</p>
            <p className="mt-1 text-xs text-slate-400">
              Ringkasan pengajuan supplier.
            </p>
          </div>
          <dl className="space-y-3 p-4 text-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">
                Supplier
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{supplier}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">
                PIC
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">{pic}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">
                Program
              </dt>
              <dd className="mt-1 font-semibold text-slate-800">
                {valueLabel(memoLabel, "program")}
              </dd>
            </div>
          </dl>
        </section>
        <TaxSettings
          fields={taxFields}
          data={data}
          onChange={onChange}
          disabled={disabled}
        />
      </aside>
      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-black text-slate-800">
              Informasi Program
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Edit informasi yang relevan dengan jenis memo ini.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {programFields.map((field) => (
              <Field
                key={field.path}
                field={field}
                data={data}
                onChange={onChange}
                disabled={disabled}
              />
            ))}
          </div>
        </section>
        <FakturProductEditor
          data={data}
          onChange={onChange}
          disabled={disabled}
        />
        {otherSections.map((section) => (
          <TransactionSection
            key={section.name}
            {...section}
            data={data}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
