import React, { useState, createElement, useMemo, FC } from 'react';
import './TestHome.styles.scss';
import c from 'classNames';

type IVariant = 'outlined' | 'filled';
type IType = 'text' | 'password' | 'number' | 'searchField';
type IStatus = 'resting' | 'disabled' | 'error' | 'success';

const states: IInputFieldProps[] = [
	{
		variant: 'outlined',
		label: 'outlined',
		type: 'text',
		helperText: 'helper',
		//isReadOnly: true,
		isRequired: true,
		status: 'success',
		defaultValue: '123',
	},
	{
		variant: 'filled',
		label: 'filled',
		type: 'text',
		helperText: 'helper',
		//isReadOnly: true,
		isRequired: true,
		//status: 'disabled',
		defaultValue: '123',
	},
];

const states2: ISliderProps[] = [
	{
		marks: [
			{ label: '1', value: 10 },
			{ label: '2', value: 40 },
		],
		value: [5, undefined],
	},
];

export const TestHome = () => {
	return (
		<div className="container">
			{states2.map((s, i) => (
				<div key={i}>
					{/* <InputFiled {...s} /> */}
					<Slider {...s} />
				</div>
			))}
		</div>
	);
};

const t = ({ text }) => {
	return <div>{text}</div>;
};

interface IInputFieldProps {
	variant: IVariant;
	label?: string;
	helperText?: string;
	isRequired?: boolean;
	isReadOnly?: boolean;
	type?: IType;
	status?: IStatus;
	autoComplete?: string[];
	defaultValue?: string;
	prefix?: FC<any>;
	suffix?: FC<any>;
	size?: 'small' | undefined;
}

const InputFiled: FC<IInputFieldProps> = ({
	variant,
	label,
	helperText,
	prefix,
	suffix,
	isRequired = false,
	isReadOnly = false,
	type = 'text',
	status = 'resting',
	autoComplete = [],
	defaultValue = '',
}) => {
	const [state, setState] = useState('');
	const inputBoxClassNames = c(
		'input-box',
		`input-box--${variant}`,
		`input-box--${status}`
	);
	const inputContainerClassNames = c('input-container', {
		'input-container--disabled': status === 'disabled',
	});
	const a = useMemo(() => {
		console.log('executed');
		return createElement(t, { text: '' });
	}, [state]);

	const getLabel = () => {
		if (status === 'disabled') return 'Disabled';
		if (isReadOnly) return 'Read Only';
		if (isRequired) return 'Required *';

		return label;
	};

	label = getLabel();

	return (
		<div>
			<div className={inputContainerClassNames}>
				<div className={inputBoxClassNames}>
					<input
						disabled={status === 'disabled'}
						readOnly={isReadOnly}
						required={isRequired}
						defaultValue={defaultValue}
						type={type}
						placeholder=" "
						onBlur={(e) => setState((e.nativeEvent.target as any).value)}
					></input>
					<label>{label}</label>
				</div>
				<span className="input-container__helper-text">{helperText}</span>
			</div>
			<p>{state}</p>
			{a}
		</div>
	);
};

interface ISliderProps {
	isDisabled?: boolean;
	min?: number;
	max?: number;
	step?: number;
	marks?: { value: number; label: string }[] | boolean;
	valueLabelDisplay?: 'auto' | 'on';
	value?: [number, number];
	color?: string;
	defaultValue?: number;
}

// if marsk true then discrete sldier using min, max, step. if marsk not present then non discrete slider
// step null - this will only use marks labels

const Slider: FC<ISliderProps> = ({
	defaultValue = 50,
	max = 100,
	min = 0,
	step = 1,
	value = [50, 20],
	marks,
}) => {
	const [input, setInput] = useState(defaultValue || value[0]);
	const [input2, setInput2] = useState(value[1]);
	const slider = c('slider');
	const sliderMark = c('slider__mark');
	const sliderRail = c('slider__rail');
	const sliderActiveRail = c('slider__active-rail');
	const sliderMarkLabel = c('slider__label');

	const handleChange = (e) => {
		setInput(e.target.value);
	};
	const handleChange2 = (e) => {
		setInput2(e.target.value);
	};

	return (
		<div className={slider}>
			<span className={sliderRail}></span>
			<span className={sliderActiveRail}>
				<span className={sliderMark}></span>
				<span className={sliderMarkLabel}>Test</span>
			</span>

			{input2 && (
				<span className={sliderMark}>
					<input
						type="range"
						min={min}
						max={max}
						value={input}
						step={step}
						onChange={handleChange}
					/>
					<label />
				</span>
			)}

			{Array.isArray(marks) && (
				<datalist id="range1">
					{marks.map(({ label, value }) => (
						<option value={value}>{label}</option>
					))}
				</datalist>
			)}
		</div>
	);
};
