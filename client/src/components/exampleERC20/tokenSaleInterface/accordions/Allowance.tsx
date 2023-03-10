import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { IInputToken } from '../../../../interface';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { setErrorTransaction, setSuccessfulTransaction } from '../../../../redux/erc-20/slides/eventEmitterSlide';
import { selectStatusBtn, setIsDisabled } from '../../../../redux/erc-20/slides/statusBtnSlide';
import { setTokenSaleWallet } from '../../../../redux/erc-20/slides/tokenSaleWalletSlide';
import { ADDRESS_INPUT_NAME, BUTTON_INNERTEXT_DECREASE_ALLOWANCE, BUTTON_INNERTEXT_INCREASE_ALLOWANCE, BUTTON_INNERTEXT_SET_ALLOWANCE, MAX_INPUT_VALUE_TOKEN, MIN_INPUT_VALUE_TOKEN, STEP_INPUT_VALUE_TOKEN, TOKEN_INPUT_NAME } from '../../../../utils/constants';
import { checkInputNumber, createParsedData } from '../../../../utils/helpFunc';
import { decreaseAllowance, getCurrentWalletTokenSale, increaseAllowance, setAllowance } from '../../../../utils/interact';
import { LoadingButton } from '../LoadingButton';


export const Allowance = () => {
    const [inputData, setInputData] = useState({} as IInputToken);
    const [isLoad, setIsLoad] = useState("" as string);
    const StatusBtn = useAppSelector(selectStatusBtn);
    const dispatch = useAppDispatch();

    const handlChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputData(prevValue => {
            return {
                ...prevValue,
                [name]: (
                    name !== ADDRESS_INPUT_NAME
                    ? checkInputNumber(value, prevValue, name)
                    : value)
            };
        });
    }
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const buttonText = e.currentTarget.innerText;
        setIsLoad(buttonText);
        dispatch(setIsDisabled(true));
        try {
            const eventEmitter =
                (buttonText === BUTTON_INNERTEXT_SET_ALLOWANCE
                    ? await setAllowance(inputData.amountToken)
                    :
                    (buttonText === BUTTON_INNERTEXT_INCREASE_ALLOWANCE
                        ? await increaseAllowance(inputData.amountToken)
                        : await decreaseAllowance(inputData.amountToken))
                )
            eventEmitter.on("data", async (data: object) => {
                dispatch(setSuccessfulTransaction(JSON.stringify(data)));
                dispatch(setTokenSaleWallet(await getCurrentWalletTokenSale()));
            });
        }
        catch (err: any) {
            dispatch(setErrorTransaction(createParsedData(err.message)));
        }
        finally {
            dispatch(setIsDisabled(false));
            setIsLoad("");
        }
    }
    return (
        <>
            <Form className="row g-3">
                <Form.Group className="col-auto">
                    <Form.Control
                        type="number"
                        name={TOKEN_INPUT_NAME}
                        value={inputData.amountToken}
                        min={MIN_INPUT_VALUE_TOKEN}
                        max={MAX_INPUT_VALUE_TOKEN}
                        step={STEP_INPUT_VALUE_TOKEN}
                        onChange={handlChangeInput}
                        placeholder="amount allowance"
                    />
                </Form.Group>
                <Form.Group className="col-auto">
                    <Button
                        variant="primary"
                        type="button"
                        onClick={handleClick}
                        className="mb-3"
                        disabled={
                            StatusBtn.isDisabled
                            || inputData.amountToken === undefined
                            || inputData.amountToken.toString() === ""}
                    >
                        {BUTTON_INNERTEXT_SET_ALLOWANCE}
                        {(isLoad === BUTTON_INNERTEXT_SET_ALLOWANCE) && <LoadingButton />}                        </Button>
                </Form.Group>
                <Form.Group className="col-auto">
                    <Button
                        variant="primary"
                        type="button"
                        onClick={handleClick}
                        className="mb-3"
                        disabled={
                            StatusBtn.isDisabled
                            || inputData.amountToken === undefined
                            || inputData.amountToken.toString() === ""}
                    >
                        {BUTTON_INNERTEXT_INCREASE_ALLOWANCE}
                        {(isLoad === BUTTON_INNERTEXT_INCREASE_ALLOWANCE) && <LoadingButton />}
                    </Button>
                </Form.Group>
                <Form.Group className="col-auto">
                    <Button
                        variant="primary"
                        type="button"
                        onClick={handleClick}
                        className="mb-3"
                        disabled={
                            StatusBtn.isDisabled
                            || inputData.amountToken === undefined
                            || inputData.amountToken.toString() === ""}
                    >
                        {BUTTON_INNERTEXT_DECREASE_ALLOWANCE}
                        {(isLoad === BUTTON_INNERTEXT_DECREASE_ALLOWANCE) && <LoadingButton />}                        </Button>
                </Form.Group>
            </Form>
            <span><strong>amount token: </strong>{MIN_INPUT_VALUE_TOKEN} - {MAX_INPUT_VALUE_TOKEN}</span><br />
        </>
    );
}
