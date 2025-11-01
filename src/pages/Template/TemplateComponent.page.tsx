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
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { DropdownChangeLanguage } from '../../components/common/Dropdown.component';
import { SystemStyle } from '../../types/theme.type';

type FormValues = {
  email: string;
  password: string;
  description: string;
};

export default function TemplateComponent() {
  const { theme, setUIStyle } = useTheme();
  const { colors } = theme;
  // Using webapp\src\locales\en\common.json so write 'common'
  const { t } = useAppTranslate('common');

  // form
  const { handleSubmit, control, getValues, watch } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    console.log('Email: ', watch('email'));
    console.log('Description: ', getValues().description);
  };

  return (
    <div className="w-full h-screen overflow-y-auto flex flex-col gap-10 ">
      <ColorPicker></ColorPicker>
      <ColorSwatches></ColorSwatches>
      <div
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          padding: 24,
          fontWeight: 900,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <h2 className='font-notoBold'>Theme Preview</h2>

        <h3>
          Primary: <strong>{colors.primary}</strong>
        </h3>

        <h3>Button Sample</h3>
        <div className="flex gap-20">
          <Button title="Default UI" onClick={() => setUIStyle(SystemStyle.Default)}></Button>
          <Button title="Neubrutalism UI" inverted={true}
            onClick={() => setUIStyle(SystemStyle.Neubrutalism)}></Button>
          <Button
            title="Pixel UI"
            leftIcon={"note"}
            rightIcon={"note"}
            onClick={() => setUIStyle(SystemStyle.Pixel)}
          ></Button>
          <Button
            title="日本語"
            leftIcon={"note"}
          ></Button>
          <Button
            title="Trường hợp 5"
            rightIcon={"note"}
            inverted
          ></Button>
          <CircleButton name="add"></CircleButton>
        </div>
        <h3>Text Sample</h3>
        <div className="flex gap-20">
          <p style={{ fontWeight: 'normal' }}>
            {`
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque fermentum odio eu sollicitudin accumsan. Aliquam et lectus mattis, aliquet magna in, tempor quam. Maecenas efficitur est ut fermentum rutrum. Aenean vel pulvinar turpis. Aliquam quis mi sed nunc venenatis venenatis. Sed sed erat ut nibh elementum ultrices at tempus arcu. Phasellus vel nibh quis leo vulputate blandit. Suspendisse efficitur fringilla magna sed pulvinar. Suspendisse leo magna, vehicula non convallis in, aliquet nec metus. Pellentesque arcu nisl, dictum a convallis a, consequat tincidunt tortor. Integer sapien metus, facilisis et diam sit amet, dapibus fringilla erat. Nulla ut facilisis dolor. Sed accumsan purus sed augue vestibulum commodo. Nam odio enim, ornare vel ultricies interdum, elementum sed dolor.
          `}
          </p>
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
          <DropdownChangeLanguage></DropdownChangeLanguage>
          <div>{t('template_demo')}</div>
        </div>
      </div>
    </div>
  );
}
