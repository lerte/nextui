import type {SliderSlots, SliderVariantProps, SlotsToClasses} from "@nextui-org/theme";

import {HTMLNextUIProps, mapPropsVariants, PropGetter} from "@nextui-org/system";
import {slider} from "@nextui-org/theme";
import {ReactRef, useDOMRef, filterDOMProps} from "@nextui-org/react-utils";
import {useSliderState} from "@react-stately/slider";
import {useMemo, useRef} from "react";
import {useNumberFormatter} from "@react-aria/i18n";
import {mergeProps} from "@react-aria/utils";
import {AriaSliderProps, useSlider as useAriaSlider} from "@react-aria/slider";
import {clsx} from "@nextui-org/shared-utils";

import {SliderThumbProps} from "./slider-thumb";

interface Props extends HTMLNextUIProps<"div"> {
  /**
   * Ref to the DOM node.
   */
  ref?: ReactRef<HTMLElement | null>;
  /**
   * The content to display as the label.
   */
  label?: string;
  /**
   * The input name.
   */
  name?: string;
  /**
   * The display format of the value label.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /**
   * Classname or List of classes to change the classNames of the element.
   * if `className` is passed, it will be added to the base slot.
   *
   * @example
   * ```ts
   * <Slider classNames={{
   *    base:"base-classes",
   *    labelWrapper: "label-wrapper-classes",
   *    label: "label-classes",
   *    output: "output-classes",
   *    track: "track-classes",
   *    filler: "filler-classes",
   *    thumb: "thumb-classes",
   * }} />
   * ```
   */
  classNames?: SlotsToClasses<SliderSlots>;
}

export type UseSliderProps = Props & AriaSliderProps & SliderVariantProps;

export function useSlider(originalProps: UseSliderProps) {
  const [props, variantProps] = mapPropsVariants(originalProps, slider.variantKeys);

  const {ref, as, name, label, formatOptions, className, classNames, ...otherProps} = props;

  const Component = as || "div";
  const shouldFilterDOMProps = typeof Component === "string";

  const domRef = useDOMRef(ref);
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const numberFormatter = useNumberFormatter(formatOptions);
  const state = useSliderState({...otherProps, numberFormatter});
  const {groupProps, trackProps, labelProps, outputProps} = useAriaSlider(
    otherProps,
    state,
    trackRef,
  );

  const baseStyles = clsx(classNames?.base, className);

  const slots = useMemo(
    () =>
      slider({
        ...variantProps,
        isRangeSlider: state.values.length > 1,
        className,
      }),
    [...Object.values(variantProps), state.values?.length, className],
  );

  const startOffset = state.values.length > 1 ? state.getThumbPercent(0) : 0;
  const endOffset = state.getThumbPercent(state.values.length - 1);

  const getBaseProps: PropGetter = (props = {}) => {
    return {
      ref: domRef,
      "data-orientation": state.orientation,
      className: slots.base({class: baseStyles}),
      ...mergeProps(
        groupProps,

        filterDOMProps(otherProps, {
          enabled: shouldFilterDOMProps,
        }),
        filterDOMProps(props),
      ),
    };
  };

  const getLabelWrapperProps: PropGetter = (props = {}) => {
    return {
      className: slots.labelWrapper({class: classNames?.labelWrapper}),
      ...props,
    };
  };

  const getLabelProps: PropGetter = (props = {}) => {
    return {
      className: slots.label({class: classNames?.label}),
      ...labelProps,
      ...props,
    };
  };

  const getOutputProps: PropGetter = (props = {}) => {
    return {
      className: slots.output({class: classNames?.output}),
      ...outputProps,
      ...props,
    };
  };

  const getTrackProps: PropGetter = (props = {}) => {
    return {
      ref: trackRef,
      className: slots.track({class: classNames?.track}),
      ...trackProps,
      ...props,
    };
  };

  const getFillerProps: PropGetter = (props = {}) => {
    return {
      className: slots.filler({class: classNames?.filler}),
      ...props,
      style: {
        ...props.style,
        left: `${startOffset * 100}%`,
        width: `${(endOffset - startOffset) * 100}%`,
      },
    };
  };

  const getThumbProps = (index: number) => {
    return {
      name,
      index,
      state,
      trackRef,
      inputRef,
      className: slots.thumb({class: classNames?.thumb}),
      ...props,
    } as SliderThumbProps;
  };

  return {
    Component,
    state,
    domRef,
    label,
    getBaseProps,
    getLabelWrapperProps,
    getLabelProps,
    getOutputProps,
    getTrackProps,
    getFillerProps,
    getThumbProps,
  };
}

export type UseSliderReturn = ReturnType<typeof useSlider>;
