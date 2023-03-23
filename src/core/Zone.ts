/**
 * Zone.
 * For the sake of avoiding key collisions, ts-reflect introduces the zone. Developers can create
 * their own zone and pass it to reflectors and access to properties they set if needed.
 * When the zone is omitted, the `defaultZone` will be passed.
 * @author James Chan
 */
export class Zone {
    /**
     * Default zone instance.
     */
    public static readonly DEFAULT: Zone = Zone.new('DEFAULT')
    /**
     * The label of this zone.
     * @private
     */
    private readonly _label: string

    /**
     * Creates a zone.
     * @param label optional
     */
    public constructor(label?: string) {
        this._label = label || ''
    }

    /**
     * Returns the label of this zone.
     */
    public get label(): string {
        return this._label
    }

    /**
     * Creates a zone.
     * @param label
     */
    public static new(label?: string) {
        return new Zone(label)
    }
}
