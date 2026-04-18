'use client';

import { useMemo, useState } from 'react';
import {
    usePointBalance,
    usePointHistory,
    useLinkedBankAccount,
    usePointWithdrawals,
    useChargePoints,
    useLinkBankAccount,
    useWithdrawPoints,
} from '@/features/pay';
import { EmptyState } from '@/shared/ui';
import { formatNumber, formatDate } from '../../model/my-page-helpers';
import {
    MyActionButton,
    MyField,
    MyInput,
    MyMessage,
} from '../../ui/my-page/MyFormControls';
import {
    MyPageLayout,
    MyPageSection,
    MyPageSummaryList,
    MyPageSummaryRow,
} from '../../ui/my-page/MyPageLayout';
import {
    formatDateTime,
    getErrorMessage,
} from '../../ui/my-page/my-page-client-utils';

type AccountFormState = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
};

type FormSubmitEvent = {
    preventDefault: () => void;
};

const EMPTY_ACCOUNT_FORM: AccountFormState = {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
};

export function MyPointPageClient() {
    const balanceQuery = usePointBalance();
    const historyQuery = usePointHistory({ page: 1, size: 20 });
    const bankAccountQuery = useLinkedBankAccount();
    const withdrawalsQuery = usePointWithdrawals({ page: 1, size: 10 });
    const chargeMutation = useChargePoints();
    const linkBankAccountMutation = useLinkBankAccount();
    const withdrawMutation = useWithdrawPoints();
    const [chargeAmount, setChargeAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [accountFormDraft, setAccountFormDraft] =
        useState<AccountFormState | null>(null);
    const [chargeFeedback, setChargeFeedback] = useState<string | null>(null);
    const [accountFeedback, setAccountFeedback] = useState<string | null>(null);
    const [withdrawFeedback, setWithdrawFeedback] = useState<string | null>(
        null,
    );

    const balance = balanceQuery.data?.data;
    const history = historyQuery.data?.data ?? [];
    const linkedAccount = bankAccountQuery.data?.data;
    const withdrawals = withdrawalsQuery.data?.data ?? [];
    const accountFormInitial = useMemo(
        () =>
            linkedAccount
                ? {
                      bankName: linkedAccount.bankName,
                      accountNumber: linkedAccount.accountNumber,
                      accountHolder: linkedAccount.accountHolder,
                  }
                : EMPTY_ACCOUNT_FORM,
        [linkedAccount],
    );
    const accountForm = accountFormDraft ?? accountFormInitial;

    const retryPointQueries = () => {
        balanceQuery.refetch();
        historyQuery.refetch();
        bankAccountQuery.refetch();
        withdrawalsQuery.refetch();
    };

    const handleChargeSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setChargeFeedback(null);
        const amount = Number(chargeAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setChargeFeedback('충전 금액을 올바르게 입력해 주세요.');
            return;
        }

        try {
            await chargeMutation.mutateAsync(amount);
            setChargeFeedback('포인트 충전을 요청했어요.');
            setChargeAmount('');
        } catch (error) {
            setChargeFeedback(
                getErrorMessage(error, '포인트를 충전하지 못했어요.'),
            );
        }
    };

    const handleAccountSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setAccountFeedback(null);

        if (
            !accountForm.bankName.trim() ||
            !accountForm.accountHolder.trim() ||
            accountForm.accountNumber.replace(/\D/g, '').length < 8
        ) {
            setAccountFeedback(
                '은행명, 예금주, 계좌번호를 다시 확인해 주세요.',
            );
            return;
        }

        try {
            await linkBankAccountMutation.mutateAsync({
                bankName: accountForm.bankName.trim(),
                accountNumber: accountForm.accountNumber.trim(),
                accountHolder: accountForm.accountHolder.trim(),
            });
            setAccountFeedback('출금 계좌를 저장했어요.');
        } catch (error) {
            setAccountFeedback(
                getErrorMessage(error, '출금 계좌를 저장하지 못했어요.'),
            );
        }
    };

    const handleWithdrawSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setWithdrawFeedback(null);
        const amount = Number(withdrawAmount);

        if (!linkedAccount) {
            setWithdrawFeedback('먼저 출금 계좌를 등록해 주세요.');
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setWithdrawFeedback('출금 금액을 올바르게 입력해 주세요.');
            return;
        }

        if (typeof balance?.balance === 'number' && amount > balance.balance) {
            setWithdrawFeedback('보유 포인트보다 큰 금액은 출금할 수 없어요.');
            return;
        }

        try {
            await withdrawMutation.mutateAsync(amount);
            setWithdrawFeedback('출금 신청을 접수했어요.');
            setWithdrawAmount('');
        } catch (error) {
            setWithdrawFeedback(
                getErrorMessage(error, '출금 신청을 완료하지 못했어요.'),
            );
        }
    };

    return (
        <MyPageLayout
            title="포인트"
            description="보유 포인트, 충전, 출금 계좌와 거래 내역을 한 번에 관리할 수 있어요."
        >
            <MyPageSection
                title="현재 잔액"
                description="포인트 사용 전 현재 상태를 확인하세요."
            >
                {balanceQuery.isPending && !balance ? (
                    <div className="space-y-3">
                        <div className="h-14 animate-pulse rounded-xl bg-muted" />
                        <div className="h-14 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : balanceQuery.isError && !balance ? (
                    <EmptyState
                        title="포인트 잔액을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: retryPointQueries,
                        }}
                    />
                ) : balance ? (
                    <MyPageSummaryList>
                        <MyPageSummaryRow
                            label="보유 포인트"
                            value={`${formatNumber(balance.balance)}P`}
                            valueClassName="text-base font-semibold"
                        />
                        <MyPageSummaryRow
                            label="최근 갱신"
                            value={formatDateTime(balance.updatedAt)}
                        />
                    </MyPageSummaryList>
                ) : (
                    <EmptyState title="포인트 잔액을 불러오지 못했어요" />
                )}
            </MyPageSection>

            <MyPageSection
                title="포인트 충전"
                description="필요한 금액만 직접 입력해 충전할 수 있어요."
            >
                <form
                    className="divide-y divide-border-soft"
                    onSubmit={handleChargeSubmit}
                >
                    <MyField label="충전 금액" required className="py-4">
                        <MyInput
                            type="number"
                            min="1"
                            step="1"
                            value={chargeAmount}
                            onChange={(event) =>
                                setChargeAmount(event.target.value)
                            }
                            placeholder="예: 10000"
                        />
                    </MyField>
                    {chargeFeedback ? (
                        <div className="py-4">
                            <MyMessage
                                tone={
                                    chargeMutation.isError ? 'error' : 'success'
                                }
                            >
                                {chargeFeedback}
                            </MyMessage>
                        </div>
                    ) : null}
                    <div className="flex justify-end py-4">
                        <MyActionButton
                            type="submit"
                            disabled={chargeMutation.isPending}
                        >
                            {chargeMutation.isPending
                                ? '충전 중...'
                                : '포인트 충전'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>

            <MyPageSection
                title="출금 계좌"
                description="정산과 출금에 사용할 계좌 정보를 저장하세요."
            >
                <form
                    className="divide-y divide-border-soft"
                    onSubmit={handleAccountSubmit}
                >
                    <MyField label="은행명" required className="py-4">
                        <MyInput
                            value={accountForm.bankName}
                            onChange={(event) =>
                                setAccountFormDraft((prev) => ({
                                    ...(prev ?? accountFormInitial),
                                    bankName: event.target.value,
                                }))
                            }
                            placeholder="예: 국민은행"
                        />
                    </MyField>
                    <MyField label="계좌번호" required className="py-4">
                        <MyInput
                            value={accountForm.accountNumber}
                            onChange={(event) =>
                                setAccountFormDraft((prev) => ({
                                    ...(prev ?? accountFormInitial),
                                    accountNumber: event.target.value,
                                }))
                            }
                            placeholder="숫자만 또는 하이픈 포함"
                        />
                    </MyField>
                    <MyField label="예금주" required className="py-4">
                        <MyInput
                            value={accountForm.accountHolder}
                            onChange={(event) =>
                                setAccountFormDraft((prev) => ({
                                    ...(prev ?? accountFormInitial),
                                    accountHolder: event.target.value,
                                }))
                            }
                            placeholder="예금주명을 입력해 주세요"
                        />
                    </MyField>
                    {linkedAccount ? (
                        <div className="py-4">
                            <MyMessage tone="muted">
                                현재 연결 계좌: {linkedAccount.bankName} /{' '}
                                {linkedAccount.accountNumber} /{' '}
                                {linkedAccount.accountHolder}
                            </MyMessage>
                        </div>
                    ) : null}
                    {accountFeedback ? (
                        <div className="py-4">
                            <MyMessage
                                tone={
                                    linkBankAccountMutation.isError
                                        ? 'error'
                                        : 'success'
                                }
                            >
                                {accountFeedback}
                            </MyMessage>
                        </div>
                    ) : null}
                    <div className="flex justify-end py-4">
                        <MyActionButton
                            type="submit"
                            disabled={linkBankAccountMutation.isPending}
                        >
                            {linkBankAccountMutation.isPending
                                ? '저장 중...'
                                : '계좌 저장'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>

            <MyPageSection
                title="포인트 출금"
                description="저장된 계좌로 출금 신청을 보낼 수 있어요."
            >
                <form
                    className="divide-y divide-border-soft"
                    onSubmit={handleWithdrawSubmit}
                >
                    <MyField label="출금 금액" required className="py-4">
                        <MyInput
                            type="number"
                            min="1"
                            step="1"
                            value={withdrawAmount}
                            onChange={(event) =>
                                setWithdrawAmount(event.target.value)
                            }
                            placeholder="예: 5000"
                        />
                    </MyField>
                    {withdrawFeedback ? (
                        <div className="py-4">
                            <MyMessage
                                tone={
                                    withdrawMutation.isError
                                        ? 'error'
                                        : 'success'
                                }
                            >
                                {withdrawFeedback}
                            </MyMessage>
                        </div>
                    ) : null}
                    <div className="flex justify-end py-4">
                        <MyActionButton
                            type="submit"
                            disabled={withdrawMutation.isPending}
                        >
                            {withdrawMutation.isPending
                                ? '신청 중...'
                                : '출금 신청'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>

            <MyPageSection
                title="거래 내역"
                description="최근 포인트 적립, 사용, 환불, 출금 기록을 확인하세요."
                contentClassName="py-0"
            >
                {historyQuery.isPending && history.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-18 animate-pulse rounded-xl bg-muted" />
                        <div className="h-18 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : historyQuery.isError && history.length === 0 ? (
                    <EmptyState
                        title="거래 내역을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: retryPointQueries,
                        }}
                    />
                ) : history.length === 0 ? (
                    <EmptyState title="거래 내역이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-border-soft">
                        {history.map((item) => (
                            <li
                                key={item.id}
                                className="px-4 py-3 transition-colors hover:bg-muted"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {item.description}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.type} ·{' '}
                                            {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="font-medium text-foreground">
                                            {item.type === 'USE' ||
                                            item.type === 'WITHDRAW'
                                                ? '-'
                                                : '+'}
                                            {formatNumber(item.amount)}P
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            잔액{' '}
                                            {formatNumber(item.balanceAfter)}P
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </MyPageSection>

            <MyPageSection
                title="출금 신청 내역"
                description="최근 출금 요청 상태를 확인할 수 있어요."
                contentClassName="py-0"
            >
                {withdrawalsQuery.isPending && withdrawals.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-18 animate-pulse rounded-xl bg-muted" />
                        <div className="h-18 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : withdrawalsQuery.isError && withdrawals.length === 0 ? (
                    <EmptyState
                        title="출금 신청 내역을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: retryPointQueries,
                        }}
                    />
                ) : withdrawals.length === 0 ? (
                    <EmptyState title="출금 신청 내역이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-border-soft">
                        {withdrawals.map((item) => (
                            <li
                                key={item.id}
                                className="px-4 py-3 transition-colors hover:bg-muted"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {formatNumber(item.amount)}P 출금
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            신청일{' '}
                                            {formatDate(item.requestedAt)}
                                        </p>
                                    </div>
                                    <p className="text-xs font-medium text-text-secondary">
                                        {item.status}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </MyPageSection>
        </MyPageLayout>
    );
}
