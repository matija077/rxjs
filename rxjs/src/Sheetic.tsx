import * as React from 'react';
import { BehaviorSubject, combineLatest, fromEvent, Subject } from 'rxjs';
import {
	filter,
	isEmpty,
	map,
	pairwise,
	switchMap,
	take,
	takeUntil,
	tap,
} from 'rxjs/operators';
import './style.scss';
import clsx from 'classnames';
import { connect } from '@rxjs-insights/devtools/connect';
import { inspect } from '@rxjs-insights/devtools';

/**
 "@rxjs-insights/devtools": "^0.5.0",
		"@rxjs-insights/plugin-webpack5": "^0.5.0",
		"@rxjs-insights/rxjs6": "^0.5.0",
 */

// TODO has moved?
// TODO  - translate

export const App = () => {
	const [hidden, setHidden] = React.useState(true);
	const [className, setClassName] = React.useState('');

	React.useEffect(() => {
		connect().then(() => console.log('connected'));

		const el = document.getElementById('ref');
		const destroy$ = new Subject();
		const isOn$ = new BehaviorSubject(false);
		const position$ = new BehaviorSubject<'top' | 'bottom'>('top');

		isOn$.subscribe((isOn) => setClassName(isOn ? '' : 'transition'));
		const movingStopped$ = isOn$.pipe(filter((isOn) => !isOn));

		const isNotOn: ([boolean, string]) => boolean = ([isOn]) => !isOn;
		const toolbarHeaderHeight = 71;
		const leftMouseClick = (e: any) => e.button === 0;
		const getEventYPosition = (e: any) => e.clientY;
		const newMovement = ([prev, current]) => current - prev;
		const excludeZeros = (v: number) => v !== 0;
		const isElementOnBottomHalfOfTheScreen = (y: number) =>
			y > window.innerHeight / 2;

		combineLatest([isOn$, position$])
			.pipe(
				filter(isNotOn),
				map(([, position]) => position),
				takeUntil(destroy$)
			)
			.subscribe((position) => {
				if (position === 'top') {
					el.style.top = '0';
				}
				if (position === 'bottom') {
					el.style.top = window.innerHeight - toolbarHeaderHeight + 'px';
				}
			});

		fromEvent(el, 'mousedown')
			.pipe(
				inspect,
				tap((e) => console.log(e)),
				filter(leftMouseClick),
				takeUntil(destroy$)
			)
			.subscribe(() => {
				isOn$.next(true);
				setHidden(false);

				const a = fromEvent(document, 'mousemove').pipe(
					take(1),
					takeUntil(movingStopped$),
					isEmpty()
				);

				const b = fromEvent(document, 'mouseup').pipe(
					takeUntil(movingStopped$)
				);
				a.subscribe({
					next: (v) => console.log(v),
					complete: () => console.log('conplete'),
				});
				combineLatest([a, b])
					.pipe(
						tap((v) => console.log(v)),
						map(([hasNotMoved]) => hasNotMoved)
					)
					.subscribe((hasNotMoved) =>
						hasNotMoved ? setHidden((prev) => !prev) : setHidden(true)
					);

				fromEvent(document, 'mousemove')
					.pipe(
						map(getEventYPosition),
						pairwise(),
						map(newMovement),
						filter(excludeZeros),
						takeUntil(movingStopped$)
					)
					.subscribe((movementY) => {
						console.log('mouse moving');
						//el.style.transform = `translateY(${newY}px)`;
						el.style.top = el.getBoundingClientRect().y + movementY + 'px';
					});

				fromEvent(document, 'mouseup')
					.pipe(
						map(() => (el as any).getBoundingClientRect().y),
						tap((e) => {
							console.log(e);
							console.log(window.innerHeight / 2);
							console.log(e > window.innerHeight / 2);
						}),
						map(isElementOnBottomHalfOfTheScreen),
						map((isBottom) => (isBottom ? 'bottom' : 'top')),
						takeUntil(movingStopped$)
					)
					.subscribe((position) => {
						position$.next(position as any);
						console.log('mouse up 1');
					});

				fromEvent(document, 'mouseup')
					.pipe(takeUntil(movingStopped$))
					.subscribe(() => {
						isOn$.next(false);
						console.log('mouse up 2');
					});
			});

		return () => {
			console.log(' i run');
			destroy$.next(null);
			destroy$.complete();
		};
	}, []);

	return (
		<div
			className={clsx(className, { open: !hidden, closed: hidden })}
			id="ref"
		>
			<div className="draggable">SHEET</div>
			{!hidden && (
				<p>
					LOREM UOPSU LRPOSJ OKSJ LKASFJ AKSLD Sld k;ksla sdalk dsk sa dsa sdma
					sda
				</p>
			)}
		</div>
	);
};
