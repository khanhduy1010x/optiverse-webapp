import { useForm } from 'react-hook-form';
import { Button, CircleButton } from '../../components/common/Button.component';
import ColorPicker, {
  ColorSwatches,
} from '../../components/common/ColorPicker.component';
import Icon from '../../components/common/Icon/Icon.component';
import { useTheme } from '../../contexts/theme.context';
import InputField, {
  PasswordInputField,
  TextareaField,
} from '../../components/common/Input.component';
import { isNotEmpty } from '../../utils/validate.util';
import {
  useAppTranslate,
  useChangeLanguage,
} from '../../hooks/useAppTranslate';

type FormValues = {
  email: string;
  password: string;
  description: string;
};

export default function TemplateComponent() {
  const { theme } = useTheme();
  const { colors, fonts } = theme;
  const { t } = useAppTranslate();
  const { changeLanguage, i18n } = useChangeLanguage();

  // form
  const { handleSubmit, control, getValues, watch } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    console.log('Email: ', watch('email'));
    console.log('Description: ', getValues().description);
  };

  return (
    <div className="w-full flex flex-col gap-10 ">
      <ColorPicker></ColorPicker>
      <ColorSwatches></ColorSwatches>
      <div
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          padding: 24,
          fontFamily: fonts.regular,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <h2 style={{ fontFamily: fonts.bold }}>Theme Preview</h2>

        <h3>
          Primary: <strong>{colors.primary}</strong>
        </h3>

        <h3>Button Sample</h3>
        <div className="flex gap-20">
          <Button title="Sample button 1"></Button>
          <Button title="Sample button 2" inverted={true}></Button>
          <Button
            title="Sample button 3"
            leftComponent={<Icon name="note"></Icon>}
            rightComponent={<Icon name="note"></Icon>}
          ></Button>
          <Button
            title="Sample button 4"
            leftComponent={<Icon name="note"></Icon>}
          ></Button>
          <Button
            title="Sample button 5"
            rightComponent={<Icon name="note" inverted></Icon>}
            inverted
          ></Button>
          <CircleButton name="add"></CircleButton>
        </div>
        <h3>Text Sample</h3>
        <div className="flex gap-20">
          <h3
            style={{
              fontFamily: fonts.regular,
            }}
          >
            NotoSans-Regular
          </h3>
          <h3
            style={{
              fontFamily: fonts.bold,
            }}
          >
            NotoSans-Bold
          </h3>
          <div
            style={{
              fontFamily: fonts.bold,
              fontSize: 16,
            }}
          >
            NotoSans-Bold 16px
          </div>
          <div
            style={{
              fontFamily: fonts.bold,
              fontSize: 24,
            }}
          >
            NotoSans-Bold 24px
          </div>
          <div
            style={{
              fontFamily: fonts.bold,
              fontSize: 32,
            }}
          >
            NotoSans-Bold 32px
          </div>
        </div>
        <h3>Input Sample</h3>
        <div className="flex gap-20">
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              width: 700,
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <InputField<FormValues>
              name="email"
              control={control}
              label="Email"
              placeholder="you@example.com"
              rules={{
                required: 'is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'is invalid',
                },
                setValueAs: v => v.trim(),
              }}
            />

            <PasswordInputField<FormValues> control={control} name="password" />

            <TextareaField<FormValues>
              name="description"
              control={control}
              label="Description"
              placeholder="Enter description..."
              rules={{
                required: 'is required',
                minLength: {
                  value: 10,
                  message: 'at least 10 characters',
                },
                setValueAs: v => v.trim(),
                validate: v => isNotEmpty(v) || 'not only white space',
              }}
            />

            <Button title="Submit" inverted></Button>
          </form>
        </div>
        <h3>Language Sample</h3>
        <div className="flex gap-20 m-auto">
          <select
            className="w-32 p-1 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-200"
            onChange={changeLanguage}
            value={i18n.language}
          >
            <option value={'en'}>English</option>
            <option value={'vi'}>Tiếng Việt</option>
          </select>
          <div>{t('template_demo')}</div>
        </div>
      </div>
    </div>
  );
}
