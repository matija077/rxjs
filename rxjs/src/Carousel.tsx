import React, { FC, useCallback, useEffect, useState } from 'react';
import { combineLatest, fromEvent, interval, Subject } from 'rxjs';
import {
	buffer,
	combineAll,
	filter,
	map,
	pairwise,
	scan,
	skipWhile,
	switchMap,
	take,
	takeUntil,
	tap,
} from 'rxjs/operators';
import { Observable, pipe } from 'rxjs';
import './style.scss';
import { connect } from '@rxjs-insights/devtools/connect';
import { inspect } from '@rxjs-insights/devtools';

interface ICarouselProps {
	images: any[];
}

export const Carousel: FC<ICarouselProps> = ({ images = [] }) => {
	images.length = 4;
	const [element, setElement] = useState(null);
	const [carouselData, setCarouselData] = useState({
		idx: 0,
		count: images.length,
	});

	const changeCurrentImgIdx = useCallback((shouldIncrease) => {
		const setState = (prevCarouselData) => {
			const nextIdx = shouldIncrease
				? prevCarouselData.idx + 1
				: prevCarouselData.idx - 1;

			if (nextIdx < 0 || nextIdx + 1 > prevCarouselData.count) {
				return prevCarouselData;
			}

			return { ...prevCarouselData, idx: nextIdx };
		};

		console.log(shouldIncrease);

		setCarouselData(setState);
	}, []);

	useEffect(() => {
		const el = document.getElementsByClassName('carousel')[0];
		setElement(el);

		const testEl = document.getElementsByClassName('test')[0];
		if (!testEl) {
			return;
		}

		fromEvent(testEl, 'mousedown').subscribe(() => {
			const sub = fromEvent(testEl, 'mousemove')
				.pipe(
					map((e: MouseEvent) => e.clientX),
					pairwise(),
					scan((acc, [prev, current]) => {
						return acc + current - prev;
					}, 0),
					map((v) => v / 1.55)
				)
				.subscribe((v) => {
					console.log(v);
					(testEl as any).style.transform = `rotate3d(0, 1, 0, ${v}deg)`;
				});

			fromEvent(testEl, 'mouseup').subscribe(() => sub.unsubscribe());
		});

		connect().then(() => console.log('connected'));
	}, []);

	useEffect(() => {
		if (!element) {
			return;
		}

		const mouseDown$ = fromEvent(element, 'mousedown');
		const mouseMove$ = fromEvent(element, 'mousemove');
		const mouseUp$ = fromEvent(element, 'mouseup');
		const stop$ = new Subject();

		const mouseDownSub = mouseDown$.subscribe(() => {
			const mouseMoveWithStop$ = mouseMove$.pipe(takeUntil(stop$));
			const mouseUpWithStop$ = mouseUp$.pipe(takeUntil(stop$));
			const swipe$ = mouseMoveWithStop$.pipe(
				map((e) => (e as MouseEvent).clientX),
				pairwise(),
				scan((acc, [prev, current]) => {
					return acc + current - prev;
				}, 0),
				skipWhile((v) => Math.abs(v) < 70),
				take(1)
			);

			mouseMoveWithStop$
				.pipe(switchMap(() => interval(3000)))
				.subscribe((v) => console.log('evo me', v));

			swipe$.subscribe({
				next: (v) => console.log(v),
				complete: () => console.log('completed swipe'),
			});

			mouseMoveWithStop$.subscribe({
				next: () => console.log('next'),
				complete: () => console.log('complete'),
			});

			combineLatest([swipe$, mouseUpWithStop$])
				.pipe(
					tap((v) => console.log(v)),
					filter(([v]) => typeof v === 'number'),
					map(([v]) => (v > 0 ? true : false))
				)
				.subscribe({
					next: (v) => changeCurrentImgIdx(v),
					complete: () => console.log('compelte combine'),
				});

			mouseUpWithStop$.subscribe(() => stop$.next(null));
		});

		return () => {
			mouseDownSub.unsubscribe();
			stop$.complete();
		};
	}, [element, changeCurrentImgIdx]);

	const imgClassName = ['first', 'second', 'third', 'fourth'][carouselData.idx];

	return (
		<div className="carousel">
			<div className={'img-container ' + imgClassName}>
				<div />
			</div>

			<div className="test">

			</div>
		</div>
	);
};

/*
<div className="test1"></div>
<div className="test2"></div>
<div className="test3"></div>
<div className="test4"></div> */
