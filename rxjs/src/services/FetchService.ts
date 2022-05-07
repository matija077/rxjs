import React, { SetStateAction } from "react";
import {
  catchError,
  concat,
  debounce,
  delay,
  first,
  fromEvent,
  map,
  of,
  race,
  retry,
  retryWhen,
  shareReplay,
  skipWhile,
  switchMap,
  tap,
  throwError,
  timer,
  zip,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  mergeMap,
  filter,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { URLS } from "./consts";

interface IError {
  error: string;
}

export const onInitialFetch = (
  urls: Partial<
    Record<keyof typeof URLS, { url: string; setState: (data: any) => void }>
  >,
  setError: (err: string) => void
) => {
  Object.values(urls).forEach((url) =>
    fetch(url.url)
      .then((stream) => stream.json())
      .then((data) => url.setState(data))
      .catch((err) => {
        setError(err);
        console.log(err);
      })
  );
};

const createFetchReturnValue = (err: unknown, data: unknown) => ({ err, data });

export const fetch$ = (url: string) =>
  fromFetch(url).pipe(
    /*retry({
      count: 5,
      delay: (err, retryCount) => {
        console.log(err);
        console.log(retryCount);
        return retryCount > 3 ? err : of().pipe(delay(2000 * retryCount));
      },

    }),*/
    switchMap((response) => {
      if (!response.ok) {
        return throwError(() => "");
      }

      return response.json();
    }),
    retry(3),
    map((data) => createFetchReturnValue(undefined, data)),
    catchError((err) => of(createFetchReturnValue(err, undefined))),
    delay(1000)
  );

export const loading$ =
  ({
    setIsLoading,
    setIsError,
    keepLoadingFor,
    showLoadingAfter,
  }: {
    setIsLoading: (value: boolean) => any;
    setIsError: (value: string) => any;
    showLoadingAfter: number;
    keepLoadingFor: number;
  }) =>
  (url: string) => {
    // there are 2 subscriptions to data so we want to use only one
    const data$ = fetch$(url).pipe(shareReplay(1));

    // error part
    data$.pipe(filter((data) => !data.err)).subscribe(({ err }) => {
      setIsError(err as string);
      console.log("error");
    });

    // delay showing of loading until showLoadingAfter
    const showLoading$ = of(true).pipe(
      delay(showLoadingAfter),
      tap((v) => setIsLoading(v))
    );
    // hide loading when showLoading emits after keepLoadingFor
    const hideLoading$ = timer(keepLoadingFor).pipe(first());

    const loading$ = concat(
      showLoading$,
      hideLoading$,
      data$.pipe(
        tap(() => {
          console.log("done loading");
          setIsLoading(false);
        })
      )
    );

    const dataAndLoading$ = race(loading$, data$).pipe(
      // data is in the format {data: ..., err: ...} so we want to skip those where err exists
      // or is 0 or boolean because of showLoading and hideLoading
      filter((dataAndLoading) => {
        if (typeof dataAndLoading !== "object" || dataAndLoading?.err) {
          return false;
        }

        return true;
      }),
      map((data) => (data as { data: unknown; err: undefined }).data)
    );

    return dataAndLoading$;
  };

export const onInput$ = ({
  debounceTimeValue,
  baseUrl,
  fetchFunc,
}: {
  debounceTimeValue: number;
  baseUrl: string;
  fetchFunc: (url: string) => Observable<unknown>;
}) => {
  const subject = new Subject<unknown>();
  const observer = subject.pipe(
    tap((v) => console.log(v)),
    debounceTime(debounceTimeValue),
    distinctUntilChanged(),
    mergeMap((param) => fetchFunc(`${baseUrl}${param}`))
  );

  return {next: (v: any) => subject.next(v), observer};
};
