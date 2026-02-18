"use client"

import React, { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "../../context/theme"
import { useRTL } from "../context/rtl"
import {
  Plus,
  Trash2,
  X,
  Filter,
  ChevronDown,
  Search,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  List,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Types
export type FieldType = "string" | "number" | "date" | "datetime" | "boolean" | "selection" | "many2one" | "many2many"

export interface FieldDefinition {
  name: string
  label: string
  type: FieldType
  options?: Array<{ value: string | number; label: string }>
  relation?: string
}

export interface FilterCondition {
  id: string
  field: string
  operator: string
  value: unknown
  logic?: "AND" | "OR"
}

export interface FilterBuilderProps {
  fields: FieldDefinition[]
  value: FilterCondition[]
  onChange: (conditions: FilterCondition[]) => void
  onApply?: () => void
  onClear?: () => void
  maxConditions?: number
  showApplyButton?: boolean
  compact?: boolean
}

// Operator definitions by field type
const operatorsByType: Record<FieldType, Array<{ value: string; label: string; needsValue: boolean }>> = {
  string: [
    { value: "ilike", label: "filters.operators.contains", needsValue: true },
    { value: "not ilike", label: "filters.operators.notContains", needsValue: true },
    { value: "=", label: "filters.operators.equals", needsValue: true },
    { value: "!=", label: "filters.operators.notEquals", needsValue: true },
    { value: "=", label: "filters.operators.isEmpty", needsValue: false },
    { value: "!=", label: "filters.operators.isNotEmpty", needsValue: false },
  ],
  number: [
    { value: "=", label: "filters.operators.equals", needsValue: true },
    { value: "!=", label: "filters.operators.notEquals", needsValue: true },
    { value: ">", label: "filters.operators.greaterThan", needsValue: true },
    { value: ">=", label: "filters.operators.greaterOrEqual", needsValue: true },
    { value: "<", label: "filters.operators.lessThan", needsValue: true },
    { value: "<=", label: "filters.operators.lessOrEqual", needsValue: true },
    { value: "between", label: "filters.operators.between", needsValue: true },
  ],
  date: [
    { value: "=", label: "filters.operators.equals", needsValue: true },
    { value: "!=", label: "filters.operators.notEquals", needsValue: true },
    { value: ">", label: "filters.operators.after", needsValue: true },
    { value: ">=", label: "filters.operators.onOrAfter", needsValue: true },
    { value: "<", label: "filters.operators.before", needsValue: true },
    { value: "<=", label: "filters.operators.onOrBefore", needsValue: true },
    { value: "between", label: "filters.operators.between", needsValue: true },
    { value: "today", label: "filters.operators.isToday", needsValue: false },
    { value: "this_week", label: "filters.operators.thisWeek", needsValue: false },
    { value: "this_month", label: "filters.operators.thisMonth", needsValue: false },
  ],
  datetime: [
    { value: "=", label: "filters.operators.equals", needsValue: true },
    { value: "!=", label: "filters.operators.notEquals", needsValue: true },
    { value: ">", label: "filters.operators.after", needsValue: true },
    { value: "<", label: "filters.operators.before", needsValue: true },
    { value: "today", label: "filters.operators.isToday", needsValue: false },
    { value: "this_week", label: "filters.operators.thisWeek", needsValue: false },
  ],
  boolean: [
    { value: "=", label: "filters.operators.isTrue", needsValue: false },
    { value: "!=", label: "filters.operators.isFalse", needsValue: false },
  ],
  selection: [
    { value: "=", label: "filters.operators.equals", needsValue: true },
    { value: "!=", label: "filters.operators.notEquals", needsValue: true },
    { value: "in", label: "filters.operators.isOneOf", needsValue: true },
    { value: "not in", label: "filters.operators.isNotOneOf", needsValue: true },
  ],
  many2one: [
    { value: "=", label: "filters.operators.equals", needsValue: true },
    { value: "!=", label: "filters.operators.notEquals", needsValue: true },
    { value: "=", label: "filters.operators.isNotSet", needsValue: false },
    { value: "!=", label: "filters.operators.isSet", needsValue: false },
  ],
  many2many: [
    { value: "in", label: "filters.operators.contains", needsValue: true },
    { value: "not in", label: "filters.operators.notContains", needsValue: true },
  ],
}

// Generate unique ID
const generateId = () => `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Get field icon
function getFieldIcon(type: FieldType) {
  switch (type) {
    case "string": return Type
    case "number": return Hash
    case "date":
    case "datetime": return Calendar
    case "boolean": return ToggleLeft
    case "selection":
    case "many2one":
    case "many2many": return List
    default: return Type
  }
}

// Filter Condition Row Component
function FilterConditionRow({
  condition,
  fields,
  index,
  isFirst,
  onChange,
  onRemove,
  onLogicChange,
}: {
  condition: FilterCondition
  fields: FieldDefinition[]
  index: number
  isFirst: boolean
  onChange: (condition: FilterCondition) => void
  onRemove: () => void
  onLogicChange: (logic: "AND" | "OR") => void
}) {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const isDark = mode === "dark"

  const selectedField = fields.find((f) => f.name === condition.field)
  const fieldType = selectedField?.type || "string"
  const operators = operatorsByType[fieldType] || operatorsByType.string
  const selectedOperator = operators.find((op) => op.value === condition.operator)

  const handleFieldChange = (fieldName: string) => {
    const field = fields.find((f) => f.name === fieldName)
    const newType = field?.type || "string"
    const newOperators = operatorsByType[newType]
    onChange({
      ...condition,
      field: fieldName,
      operator: newOperators[0].value,
      value: "",
    })
  }

  const handleOperatorChange = (operator: string) => {
    onChange({
      ...condition,
      operator,
      value: "",
    })
  }

  const handleValueChange = (value: unknown) => {
    onChange({ ...condition, value })
  }

  const inputClasses = `w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isDark
      ? "bg-slate-800 border-slate-700 text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
      : "bg-white border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
  } border focus:outline-none`

  const selectClasses = `px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
    isDark
      ? "bg-slate-800 border-slate-700 text-white focus:border-violet-500"
      : "bg-white border-slate-200 text-slate-900 focus:border-violet-500"
  } border focus:outline-none focus:ring-2 focus:ring-violet-500/20`

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
      className="flex flex-col gap-2"
    >
      {/* Logic selector (AND/OR) - show for all except first */}
      {!isFirst && (
        <div className="flex items-center gap-3 my-1">
          <div className={`h-px flex-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => onLogicChange("AND")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                condition.logic === "AND"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t("filters.and")}
            </button>
            <button
              onClick={() => onLogicChange("OR")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                condition.logic === "OR"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t("filters.or")}
            </button>
          </div>
          <div className={`h-px flex-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
        </div>
      )}

      {/* Condition row */}
      <div className={`flex flex-wrap items-center gap-3 p-4 rounded-xl transition-colors ${
        isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-slate-50 border border-slate-100"
      }`}>
        {/* Field selector */}
        <div className="flex-1 min-w-[150px]">
          <select
            value={condition.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            className={selectClasses}
          >
            <option value="">{t("filters.selectField")}</option>
            {fields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operator selector */}
        <div className="flex-1 min-w-[140px]">
          <select
            value={condition.operator}
            onChange={(e) => handleOperatorChange(e.target.value)}
            className={selectClasses}
            disabled={!condition.field}
          >
            {operators.map((op, idx) => (
              <option key={`${op.value}-${idx}`} value={op.value}>
                {t(op.label)}
              </option>
            ))}
          </select>
        </div>

        {/* Value input */}
        {selectedOperator?.needsValue !== false && (
          <div className="flex-1 min-w-[150px]">
            {fieldType === "boolean" ? null : fieldType === "selection" || fieldType === "many2one" ? (
              <select
                value={condition.value as string}
                onChange={(e) => handleValueChange(e.target.value)}
                className={selectClasses}
              >
                <option value="">{t("filters.selectValue")}</option>
                {selectedField?.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : fieldType === "date" || fieldType === "datetime" ? (
              <input
                type={fieldType === "datetime" ? "datetime-local" : "date"}
                value={condition.value as string || ""}
                onChange={(e) => handleValueChange(e.target.value)}
                className={inputClasses}
              />
            ) : fieldType === "number" ? (
              <input
                type="number"
                value={condition.value as number || ""}
                onChange={(e) => handleValueChange(e.target.value ? Number(e.target.value) : "")}
                placeholder={t("filters.enterValue")}
                className={inputClasses}
              />
            ) : (
              <input
                type="text"
                value={condition.value as string || ""}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={t("filters.enterValue")}
                className={inputClasses}
              />
            )}
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isDark
              ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
              : "text-slate-400 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Main Filter Builder Component
export function FilterBuilder({
  fields,
  value,
  onChange,
  onApply,
  onClear,
  maxConditions = 10,
  showApplyButton = true,
  compact = false,
}: FilterBuilderProps) {
  const { t } = useTranslation()
  const { mode } = useTheme()
  const { isRTL } = useRTL()
  const isDark = mode === "dark"
  const [isExpanded, setIsExpanded] = useState(value.length > 0)

  const addCondition = useCallback(() => {
    if (value.length >= maxConditions) return
    const newCondition: FilterCondition = {
      id: generateId(),
      field: fields[0]?.name || "",
      operator: operatorsByType[fields[0]?.type || "string"][0].value,
      value: "",
      logic: value.length > 0 ? "AND" : undefined,
    }
    onChange([...value, newCondition])
    setIsExpanded(true)
  }, [value, fields, maxConditions, onChange])

  const updateCondition = useCallback(
    (index: number, condition: FilterCondition) => {
      const newConditions = [...value]
      newConditions[index] = condition
      onChange(newConditions)
    },
    [value, onChange]
  )

  const removeCondition = useCallback(
    (index: number) => {
      const newConditions = value.filter((_, i) => i !== index)
      if (newConditions.length > 0 && newConditions[0].logic) {
        newConditions[0] = { ...newConditions[0], logic: undefined }
      }
      onChange(newConditions)
    },
    [value, onChange]
  )

  const updateLogic = useCallback(
    (index: number, logic: "AND" | "OR") => {
      const newConditions = [...value]
      newConditions[index] = { ...newConditions[index], logic }
      onChange(newConditions)
    },
    [value, onChange]
  )

  const clearAll = useCallback(() => {
    onChange([])
    onClear?.()
  }, [onChange, onClear])

  const activeCount = value.filter((c) => c.field && c.value !== "").length

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isDark
        ? "bg-slate-900/50 border border-slate-800"
        : "bg-white border border-slate-100"
    }`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between transition-colors ${
          compact ? "p-4" : "p-5"
        } ${isExpanded ? "border-b" : ""} ${isDark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isDark ? "bg-violet-500/10" : "bg-violet-50"
          }`}>
            <Filter className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-left">
            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
              {t("filters.title")}
            </span>
            {activeCount > 0 && (
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {activeCount} {t("filters.activeFilters") || "active filters"}
              </p>
            )}
          </div>
          {activeCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-violet-500 text-white rounded-lg shadow-lg shadow-violet-500/25">
              {activeCount}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-3">
              {/* Conditions */}
              <AnimatePresence mode="popLayout">
                {value.map((condition, index) => (
                  <FilterConditionRow
                    key={condition.id}
                    condition={condition}
                    fields={fields}
                    index={index}
                    isFirst={index === 0}
                    onChange={(c) => updateCondition(index, c)}
                    onRemove={() => removeCondition(index)}
                    onLogicChange={(logic) => updateLogic(index, logic)}
                  />
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {value.length === 0 && (
                <div className={`flex flex-col items-center justify-center py-10 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  }`}>
                    <Sparkles className={`w-6 h-6 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                  </div>
                  <p className="text-sm font-medium">{t("filters.noFilters")}</p>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {t("filters.addFilterHint") || "Add a filter to narrow down results"}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className={`flex flex-wrap items-center gap-3 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <button
                  onClick={addCondition}
                  disabled={value.length >= maxConditions}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    value.length >= maxConditions
                      ? "opacity-40 cursor-not-allowed"
                      : isDark
                        ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20"
                        : "bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-100"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t("filters.addCondition")}
                </button>

                {value.length > 0 && (
                  <>
                    <button
                      onClick={clearAll}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isDark
                          ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                          : "text-slate-500 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"
                      }`}
                    >
                      <X className="w-4 h-4" />
                      {t("filters.clearAll")}
                    </button>
                  </>
                )}

                {showApplyButton && value.length > 0 && (
                  <button
                    onClick={onApply}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${isRTL ? "mr-auto" : "ml-auto"} bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40`}
                  >
                    <Search className="w-4 h-4" />
                    {t("filters.apply")}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to convert FilterConditions to Odoo domain
export function buildOdooDomain(conditions: FilterCondition[]): unknown[] {
  if (conditions.length === 0) return []

  const domain: unknown[] = []

  conditions.forEach((condition, index) => {
    if (!condition.field) return

    if (index > 0) {
      if (condition.logic === "OR") {
        domain.unshift("|")
      }
    }

    let operator = condition.operator
    let value = condition.value

    switch (operator) {
      case "today":
        operator = "="
        value = new Date().toISOString().split("T")[0]
        break
      case "this_week": {
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        domain.push([condition.field, ">=", startOfWeek.toISOString().split("T")[0]])
        operator = "<="
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        value = endOfWeek.toISOString().split("T")[0]
        break
      }
      case "this_month": {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        domain.push([condition.field, ">=", startOfMonth.toISOString().split("T")[0]])
        operator = "<="
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        value = endOfMonth.toISOString().split("T")[0]
        break
      }
      case "isEmpty":
        operator = "="
        value = false
        break
      case "isNotEmpty":
        operator = "!="
        value = false
        break
      case "isTrue":
        operator = "="
        value = true
        break
      case "isFalse":
        operator = "="
        value = false
        break
    }

    domain.push([condition.field, operator, value])
  })

  return domain
}

// Export default fields for common CRM models
export const leadFields: FieldDefinition[] = [
  { name: "name", label: "Lead Name", type: "string" },
  { name: "email_from", label: "Email", type: "string" },
  { name: "phone", label: "Phone", type: "string" },
  { name: "expected_revenue", label: "Expected Revenue", type: "number" },
  { name: "probability", label: "Probability", type: "number" },
  { name: "priority", label: "Priority", type: "selection", options: [
    { value: "0", label: "Low" },
    { value: "1", label: "Medium" },
    { value: "2", label: "High" },
    { value: "3", label: "Very High" },
  ]},
  { name: "stage_id", label: "Stage", type: "many2one" },
  { name: "user_id", label: "Salesperson", type: "many2one" },
  { name: "team_id", label: "Sales Team", type: "many2one" },
  { name: "create_date", label: "Created Date", type: "datetime" },
  { name: "date_deadline", label: "Expected Closing", type: "date" },
  { name: "active", label: "Active", type: "boolean" },
]

export const contactFields: FieldDefinition[] = [
  { name: "name", label: "Name", type: "string" },
  { name: "email", label: "Email", type: "string" },
  { name: "phone", label: "Phone", type: "string" },
  { name: "mobile", label: "Mobile", type: "string" },
  { name: "is_company", label: "Is Company", type: "boolean" },
  { name: "parent_id", label: "Company", type: "many2one" },
  { name: "city", label: "City", type: "string" },
  { name: "country_id", label: "Country", type: "many2one" },
  { name: "customer_rank", label: "Customer Rank", type: "number" },
  { name: "create_date", label: "Created Date", type: "datetime" },
]

export const opportunityFields: FieldDefinition[] = [
  ...leadFields,
  { name: "won_status", label: "Won Status", type: "selection", options: [
    { value: "pending", label: "Pending" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ]},
]

export default FilterBuilder
