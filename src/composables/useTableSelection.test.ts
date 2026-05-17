import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTableSelection } from "./useTableSelection";

describe("useTableSelection", () => {
  describe("isSelected", () => {
    let useSelection: ReturnType<typeof useTableSelection<{ id: string | number }>>;

    beforeEach(() => {
      useSelection = useTableSelection<{ id: string | number }>();
    });

    it("应返回 false 当没有选中项时", () => {
      expect(useSelection.isSelected(1)).toBe(false);
      expect(useSelection.isSelected("1")).toBe(false);
    });

    it("应返回 true 当传入的ID在选中列表中时", () => {
      useSelection.handleSelectionChange([
        { id: 1 },
        { id: 2 },
        { id: "3" },
      ]);

      expect(useSelection.isSelected(1)).toBe(true);
      expect(useSelection.isSelected(2)).toBe(true);
      expect(useSelection.isSelected("3")).toBe(true);
    });

    it("应返回 false 当传入的ID不在选中列表中时", () => {
      useSelection.handleSelectionChange([{ id: 1 }, { id: 2 }]);

      expect(useSelection.isSelected(3)).toBe(false);
      expect(useSelection.isSelected("999")).toBe(false);
    });

    it("应正确处理 string 和 number 类型的ID", () => {
      useSelection.handleSelectionChange([
        { id: 100 },
        { id: "str-id-1" },
      ]);

      expect(useSelection.isSelected(100)).toBe(true);
      expect(useSelection.isSelected("str-id-1")).toBe(true);
      expect(useSelection.isSelected(101)).toBe(false);
      expect(useSelection.isSelected("str-id-2")).toBe(false);
    });

    it("清空选择后应返回 false", () => {
      useSelection.handleSelectionChange([{ id: 1 }]);
      expect(useSelection.isSelected(1)).toBe(true);

      useSelection.clearSelection();
      expect(useSelection.isSelected(1)).toBe(false);
    });

    it("更新选择后应正确反映新的选中状态", () => {
      useSelection.handleSelectionChange([{ id: 1 }, { id: 2 }]);
      expect(useSelection.isSelected(1)).toBe(true);
      expect(useSelection.isSelected(2)).toBe(true);

      useSelection.handleSelectionChange([{ id: 2 }, { id: 3 }]);
      expect(useSelection.isSelected(1)).toBe(false);
      expect(useSelection.isSelected(2)).toBe(true);
      expect(useSelection.isSelected(3)).toBe(true);
    });
  });
});
