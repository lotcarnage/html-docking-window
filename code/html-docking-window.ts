namespace UiParts {
	export class HtmlWindowContainer {
		private container_: HTMLDivElement;
		private window_list_: HtmlDockingWindow[];
		private container_type_: "single" | "horizontal" | "vertical";
		constructor(initial_window: HtmlDockingWindow) {
			this.container_ = document.createElement("div");
			this.container_type_ = "single";
			this.container_.style.display = "grid";
			this.container_.style.gridAutoColumns = "max-content";
			this.container_.style.gridAutoRows = "max-content";
			this.container_.style.gridTemplateAreas = `'"a0"'`;
			this.window_list_ = new Array<HtmlDockingWindow>(0);
			this.window_list_.push(initial_window);
			this.container_.appendChild(initial_window.root);
			initial_window.root.style.gridArea = "a0";
			initial_window.parent_container = this;
		}
		private UpdateGridArea(): void {
			const num_windows = this.window_list_.length;
			for (let i = 0; i < num_windows; i++) {
				this.window_list_[i].root.style.gridArea = `a${i}`;
			}
			const grid_area_array = new Array<string>(num_windows);
			if (this.container_type_ === "vertical") {
				for (let i = 0; i < num_windows; i++) {
					grid_area_array[i] = `"a${i}"`;
				}
				this.container_.style.gridTemplateAreas = `${grid_area_array.join(" ")}`;
			} else {
				for (let i = 0; i < num_windows; i++) {
					grid_area_array[i] = `a${i}`;
				}
				this.container_.style.gridTemplateAreas = `"${grid_area_array.join(" ")}"`;
			}
			return;
		}
		public GetEntryType(): { horizontal: boolean, vertical: boolean } {
			if (this.window_list_.length <= 1) {
				return { horizontal: true, vertical: true };
			}
			if (this.container_type_ === "horizontal") {
				return { horizontal: true, vertical: false };
			}
			return { horizontal: false, vertical: true };
		}
		public Enter(new_window: HtmlDockingWindow, index: number, entry_type: "single" | "horizontal" | "vertical"): void {
			this.window_list_.splice(index, 0, new_window);
			this.container_.appendChild(new_window.root);
			new_window.parent_container = this;
			if (this.window_list_.length === 2) {
				this.container_type_ = entry_type;
			}
			this.UpdateGridArea();
		}
		public Remove(remove_window: HtmlDockingWindow): boolean {
			if (remove_window.root.parentElement !== this.container_) {
				return false;
			}
			const index = parseInt(remove_window.root.style.gridArea.slice(1));
			this.window_list_.splice(index, 1);
			this.container_.removeChild(remove_window.root);
			remove_window.parent_container = null;
			if (this.window_list_.length === 1) {
				this.container_type_ = "single";
			}
			this.UpdateGridArea();
			return true;
		}
		public get root(): HTMLDivElement {
			return this.container_;
		}
		private UnifyWidth(width: number) {
			for (let window of this.window_list_) {
				if (parseInt(window.frame.style.width) !== width) {
					window.frame.style.width = width.toString();
				}
			}
		}
		private UnifyHeight(height: number) {
			for (let window of this.window_list_) {
				if (parseInt(window.frame.style.height) !== height) {
					window.frame.style.height = height.toString();
				}
			}
		}
		public UnifySize(width: number, height: number) {
			if (this.container_type_ === "horizontal") {
				this.UnifyHeight(height);
			} else if (this.container_type_ === "vertical") {
				this.UnifyWidth(width);
			}
			return;
		}
	}

	type DropType = "top" | "left" | "bottom" | "right";
	type DropCallback = (drop_area_type: DropType) => void;
	export class DropArea {
		private static h_width = 20;
		private static h_height = 36;
		private static v_width = 36;
		private static v_height = 20;
		private drop_area_top_: HTMLDivElement;
		private drop_area_bottom_: HTMLDivElement;
		private drop_area_left_: HTMLDivElement;
		private drop_area_right_: HTMLDivElement;
		private drop_areas_: HTMLDivElement[];
		private parent_: HTMLDivElement;
		private is_visible_: boolean;
		private static CreateDropArea(width: number, height: number, drop_type: DropType, drop_callback: DropCallback): HTMLDivElement {
			let is_drag_overed = false;
			const drop_area = document.createElement("div");
			drop_area.style.display = "none";
			drop_area.style.backgroundColor = "#ffffff";
			drop_area.setAttribute("class", "DropArea");
			drop_area.style.border = "2px solid #202020;";
			drop_area.style.position = "absolute";
			drop_area.style.width = `${width}px`;
			drop_area.style.height = `${height}px`;

			drop_area.addEventListener("dragenter", (event) => {
				if (is_drag_overed === false) {
					drop_area.style.backgroundColor = "#ff0000";
					is_drag_overed = true;
					console.log("# enter");
				}
			});
			drop_area.addEventListener("dragover", (event) => {
				event.preventDefault();
			});
			drop_area.addEventListener("dragleave", (event) => {
				if (is_drag_overed) {
					drop_area.style.backgroundColor = "#ffffff";
					is_drag_overed = false;
				}
				console.log("# leave");
			});
			drop_area.addEventListener("drop", (event) => {
				event.stopPropagation();
				event.preventDefault();
				if (is_drag_overed) {
					drop_callback(drop_type);
					drop_area.style.backgroundColor = "#ffffff";
					is_drag_overed = false;
				}
				console.log("# drop");
			});
			return drop_area;
		}
		private ApplyPosition() {
			const center_x = Math.floor(this.parent_.clientWidth / 2);
			const center_y = Math.floor(this.parent_.clientHeight / 2);
			const top = center_y - DropArea.v_height - Math.floor(DropArea.h_height / 2);
			const left = center_x - DropArea.h_width - Math.floor(DropArea.v_width / 2);
			this.drop_area_top_.style.top = `${top}px`;
			this.drop_area_top_.style.left = `${left + DropArea.h_width}px`;
			this.drop_area_bottom_.style.top = `${top + DropArea.h_height + DropArea.v_height}px`;
			this.drop_area_bottom_.style.left = `${left + DropArea.h_width}px`;
			this.drop_area_left_.style.top = `${top + DropArea.v_height}px`;
			this.drop_area_left_.style.left = `${left}px`;
			this.drop_area_right_.style.top = `${top + DropArea.v_height}px`;
			this.drop_area_right_.style.left = `${left + DropArea.h_width + DropArea.v_width}px`;
		}
		constructor(parent: HTMLDivElement, drop_callback: DropCallback) {
			this.parent_ = parent;
			this.is_visible_ = false;
			this.drop_area_top_ = DropArea.CreateDropArea(DropArea.v_width, DropArea.v_height, "top", drop_callback);
			this.drop_area_bottom_ = DropArea.CreateDropArea(DropArea.v_width, DropArea.v_height, "bottom", drop_callback);
			this.drop_area_left_ = DropArea.CreateDropArea(DropArea.h_width, DropArea.h_height, "left", drop_callback);
			this.drop_area_right_ = DropArea.CreateDropArea(DropArea.h_width, DropArea.h_height, "right", drop_callback);
			this.drop_areas_ = new Array<HTMLDivElement>(0);
			this.drop_areas_.push(this.drop_area_top_);
			this.drop_areas_.push(this.drop_area_bottom_);
			this.drop_areas_.push(this.drop_area_left_);
			this.drop_areas_.push(this.drop_area_right_);
			parent.appendChild(this.drop_area_top_);
			parent.appendChild(this.drop_area_bottom_);
			parent.appendChild(this.drop_area_left_);
			parent.appendChild(this.drop_area_right_);
		}
		public Appear(): void {
			if (this.is_visible_ === true) {
				return;
			}
			this.ApplyPosition();
			for (let drop_area of this.drop_areas_) {
				drop_area.style.display = "block";
			}
			console.log("Appear");
			this.is_visible_ = true;
		}
		public HideUp(): void {
			if (this.is_visible_ === false) {
				return;
			}
			for (let drop_area of this.drop_areas_) {
				drop_area.style.display = "none";
				drop_area.style.backgroundColor = "#ffffff";
			}
			console.log("Hide");
			this.is_visible_ = false;
		}
	}

	export class HtmlDockingWindow {
		private window_id_: number;
		private window_holder_: HTMLDivElement;
		private window_exterior_: HTMLDivElement;
		private window_title_area_: HTMLDivElement;
		private window_interior_: HTMLDivElement;
		private user_interior_: HTMLElement;
		private drop_area_: DropArea;
		private is_darg_entering: boolean;
		private parent_container_: HtmlWindowContainer | null;
		private static window_list_: HtmlDockingWindow[] | null;
		private static window_id_counter_: number;
		private static object_locate_table_: Map<HTMLDivElement, HtmlDockingWindow> | null;
		private static observer_: MutationObserver | null;

		private static CreateText(text: string): HTMLSpanElement {
			const span = document.createElement("span");
			span.innerHTML = text;
			return span;
		}
		private static SwapWindow(lhv_window_id_: number, rhv_window_id_: number) {
			if (lhv_window_id_ === rhv_window_id_) return;
			if (HtmlDockingWindow.window_list_ === null) {
				return;
			}
			let lhw: HtmlDockingWindow | null = null;
			let rhw: HtmlDockingWindow | null = null;
			for (let element of HtmlDockingWindow.window_list_) {
				if (element.window_id_ === lhv_window_id_) {
					lhw = element;
				}
				if (element.window_id_ === rhv_window_id_) {
					rhw = element;
				}
			}
			if (lhw === null) return;
			if (rhw === null) return;
			if (lhw.parent_container_ === null) return;
			if (rhw.parent_container_ === null) return;
			const lhw_parent = lhw.parent_container_;
			const rhw_parent = rhw.parent_container_;
			const lhw_grid_area = lhw.window_holder_.style.gridArea;
			const rhw_grid_area = rhw.window_holder_.style.gridArea;
			const lhw_type = lhw_parent.GetEntryType();
			const rhw_type = rhw_parent.GetEntryType();
			if (lhw.window_holder_.contains(rhw.window_holder_)) return;
			if (rhw.window_holder_.contains(lhw.window_holder_)) return;

			lhw_parent.Remove(lhw);
			rhw_parent.Remove(rhw);
			const EnterType = function (enrty_type: { horizontal: boolean, vertical: boolean }): "single" | "horizontal" | "vertical" {
				if (enrty_type.vertical === true && enrty_type.horizontal === true) {
					return "single";
				}
				if (enrty_type.vertical === true) {
					return "vertical";
				}
				return "horizontal";
			};
			lhw_parent.Enter(rhw, parseInt(lhw_grid_area.slice(1)), EnterType(lhw_type));
			rhw_parent.Enter(lhw, parseInt(rhw_grid_area.slice(1)), EnterType(rhw_type));
			console.log(lhv_window_id_, rhv_window_id_);
			console.log(lhw.window_title_area_.innerText, rhw.window_title_area_.innerText);
			console.log(lhw.window_holder_.style.gridArea, rhw.window_holder_.style.gridArea);
		}
		constructor(title: string, interior: HTMLElement) {
			if (!HtmlDockingWindow.window_list_) {
				HtmlDockingWindow.window_list_ = new Array<HtmlDockingWindow>(0);
				HtmlDockingWindow.window_id_counter_ = 0;
			}
			if (!HtmlDockingWindow.object_locate_table_) {
				HtmlDockingWindow.object_locate_table_ = new Map<HTMLDivElement, HtmlDockingWindow>();
			}
			if (!HtmlDockingWindow.observer_) {
				HtmlDockingWindow.observer_ = new MutationObserver((mutations) => {
					mutations.forEach((mutation) => {
						if (mutation.type !== "attributes") {
							return;
						}
						if (HtmlDockingWindow.object_locate_table_ === null) {
							return;
						}
						const element = <HTMLDivElement>(mutation.target);
						const target_window = HtmlDockingWindow.object_locate_table_.get(element);
						target_window?.parent_container_?.UnifySize(parseInt(element.style.width), parseInt(element.style.height))
					});
				});
			}
			this.is_darg_entering = false;
			this.window_id_ = HtmlDockingWindow.window_id_counter_;
			HtmlDockingWindow.window_id_counter_++;
			HtmlDockingWindow.window_list_.push(this);

			this.user_interior_ = interior;
			this.window_holder_ = document.createElement("div");
			this.window_exterior_ = document.createElement("div");
			this.window_title_area_ = document.createElement("div");
			this.window_interior_ = document.createElement("div");
			this.window_title_area_.appendChild(HtmlDockingWindow.CreateText(title));
			this.window_exterior_.appendChild(this.window_title_area_);
			this.window_exterior_.appendChild(this.window_interior_);
			this.window_interior_.appendChild(interior);
			this.window_holder_.appendChild(this.window_exterior_);

			this.drop_area_ = new DropArea(this.window_holder_, (drop_type) => {
				console.log(drop_type);
			});

			this.window_holder_.style.position = "relative";
			this.window_holder_.draggable = true;
			this.window_exterior_.style.minWidth = `${title.length}em`;
			this.window_exterior_.style.minHeight = `2em`;
			this.window_exterior_.style.overflow = "scroll";
			this.window_exterior_.style.resize = "both";
			this.window_exterior_.style.width = "300px";
			this.window_exterior_.style.margin = "0px";
			this.window_title_area_.style.backgroundColor = "#a0d0c0";
			this.window_interior_.style.backgroundColor = "#aaaaaa";
			this.window_exterior_.style.backgroundColor = "#909090";
			this.window_holder_.style.backgroundColor = "#909090";
			this.parent_container_ = null;
			HtmlDockingWindow.object_locate_table_.set(this.window_exterior_, this);

			this.window_holder_.addEventListener('dragstart', (event) => {
				if (event === null) return;
				if (event.dataTransfer === null) return;
				event.stopPropagation();
				event.dataTransfer.setData("window_id", this.window_id_.toString());
				console.log("drag start", this.window_title_area_.innerText);
			});
			this.window_holder_.addEventListener('dragenter', (event) => {
				event.preventDefault();
				const rect = (<HTMLDivElement>event.currentTarget).getBoundingClientRect();
				console.log("drag enter 1", this.window_title_area_.innerText, this.is_darg_entering, rect.top, rect.left, rect.bottom, rect.right, `(${event.clientX}, ${event.clientY})`);
				if (this.is_darg_entering === false) {
					if (event && event.dataTransfer) {
						const drag_window_id = parseInt(event.dataTransfer.getData("window_id"));
						if (this.window_id_ !== drag_window_id) {
							this.drop_area_.Appear();
						}
					}
					this.is_darg_entering = true;
					console.log("  drag enter 2", this.window_title_area_.innerText, this.is_darg_entering);
				}
			});
			this.window_holder_.addEventListener('dragleave', (event) => {
				event.preventDefault();
				if (this.is_darg_entering === false) {
					console.log(this.window_title_area_.innerText, this.is_darg_entering);
					return;
				}
				const rect = (<HTMLDivElement>event.currentTarget).getBoundingClientRect();
				if (event.clientY < rect.top || rect.bottom <= event.clientY || event.clientX < rect.left || rect.right <= event.clientX) {
					this.is_darg_entering = false;
					this.drop_area_.HideUp();
					console.log("  drag leave 2", this.window_title_area_.innerText, this.is_darg_entering);
				}
				console.log("drag leave 1", this.window_title_area_.innerText, this.is_darg_entering, rect.top, rect.left, rect.bottom, rect.right, `(${event.clientX}, ${event.clientY})`);
			});
			this.window_holder_.addEventListener('dragover', (event) => {
				event.preventDefault();
			});
			this.window_holder_.addEventListener('drop', (event) => {
				if (event === null) return;
				if (event.dataTransfer === null) return;
				event.stopPropagation();
				event.preventDefault();
				this.drop_area_.HideUp();
				const drag_window_id = parseInt(event.dataTransfer.getData("window_id"));
				HtmlDockingWindow.SwapWindow(this.window_id_, drag_window_id);
			});

			this.window_holder_.addEventListener("resize", (event) => {
				this.window_exterior_.style.width = this.window_holder_.style.width;
				this.window_exterior_.style.height = this.window_holder_.style.height;
			});
			HtmlDockingWindow.observer_?.observe(this.window_exterior_, { attributes: true, childList: true, characterData: true });
		}
		public get root(): HTMLDivElement {
			return this.window_holder_;
		}
		public get frame(): HTMLDivElement {
			return this.window_exterior_;
		}
		public set interior(new_interior: HTMLElement) {
			this.window_interior_.removeChild(this.user_interior_);
			this.window_interior_.appendChild(new_interior);
			this.user_interior_ = new_interior;
		}
		public set parent_container(parent: HtmlWindowContainer | null) {
			this.parent_container_ = parent;
		}
	}
}